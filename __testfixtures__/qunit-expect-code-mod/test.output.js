import { module, test } from "qunit";
import { click, visit, currentURL } from "@ember/test-helpers";
import { setupApplicationTest } from "ember-qunit";
import defaultScenario from "elevate-web/mirage/scenarios/default";
import setupMirage from "ember-cli-mirage/test-support/setup-mirage";
import { setupModalOutlet } from "artdeco-modal/test-support";
import { setupSinonSandbox } from "ember-sinon-sandbox/test-support";
import { adminPermissionsScenario } from "elevate-web/mirage/scenarios/permissions";
import { fromUrn } from "elevate-web/utils/urn-converter";
import browserGlobals from "elevate-web/utils/browser-globals";
import { setupLixTesting } from "ember-cli-pemberly-lix/test-support";

module("Acceptance | Discover", function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupModalOutlet(hooks);
  setupSinonSandbox(hooks);
  setupLixTesting(hooks);

  hooks.beforeEach(function() {
    defaultScenario(this.server);
    // default to permissions associated with the admin role
    adminPermissionsScenario(this.server);
  });

  test("A user can view topics and filter them by category", async function(assert) {
    assert.expect(17);
    await visit("/discover");
    assert.equal(
      currentURL(),
      "/discover?category=all",
      "The default all category param is initially present"
    );

    assert
      .dom("[data-test-category-dropdown-trigger]")
      .hasText(
        "All categories",
        "The category dropdown is initially set to All Categories"
      );

    await click("[data-test-category-dropdown-trigger]");

    const totalTopicsCount = this.server.db.elevateTopics.length;
    const uncategorizedTopicsCount = this.server.db.elevateTopics.where({
      categoryId: null
    }).length;
    const subscribedTopicsCount = this.server.db.elevateTopics.where({
      subscribed: true
    }).length;

    assert
      .dom('[data-test-category-dropdown-item="all"]')
      .hasText(
        `All categories (${totalTopicsCount})`,
        "The all topics dropdown option has the expected count"
      );

    assert
      .dom(
        '[data-test-category-dropdown-item="all"] .discover__selected-category-name'
      )
      .exists(
        "The selected css class is applied to the all categories dropdown item"
      );

    await click('[data-test-category-dropdown-item="all"]');

    assert
      .dom("[data-test-topic-card]")
      .exists(
        { count: totalTopicsCount },
        "The number of total topic cards matches the total displayed in the all topics dropdown option"
      );

    assert.equal(
      currentURL(),
      "/discover?category=all",
      "The category query param has the expected value"
    );

    await click("[data-test-category-dropdown-trigger]");

    assert
      .dom('[data-test-category-dropdown-item="uncategorized"]')
      .hasText(
        `Uncategorized (${uncategorizedTopicsCount})`,
        "The uncategorized topics dropdown option has the expected count"
      );

    await click('[data-test-category-dropdown-item="uncategorized"]');

    assert
      .dom("[data-test-topic-card]")
      .exists(
        { count: uncategorizedTopicsCount },
        "The number of uncategorized topic cards matches the total displayed in the uncategorized dropdown option"
      );
    assert.equal(
      currentURL(),
      "/discover?category=uncategorized",
      "The category query param has the expected value"
    );

    await click("[data-test-category-dropdown-trigger]");

    assert
      .dom('[data-test-category-dropdown-item="subscribed"]')
      .hasText(
        `Subscribed topics (${subscribedTopicsCount})`,
        "The subscribed topics dropdown option has the expected count"
      );

    await click('[data-test-category-dropdown-item="subscribed"]');

    assert
      .dom("[data-test-topic-card]")
      .exists(
        { count: subscribedTopicsCount },
        "The number of subscribed topic cards matches the total displayed in the subscribed dropdown option"
      );
    assert.equal(
      currentURL(),
      "/discover?category=subscribed",
      "The category query param has the expected value"
    );

    const firstCategoryWithTopics = this.server.schema.elevateTopics.findBy(
      ({ categoryId }) => !!categoryId
    ).category;
    const topicsForCategoryCount = this.server.schema.elevateTopics.where({
      categoryId: firstCategoryWithTopics.id
    }).length;

    await click("[data-test-category-dropdown-trigger]");

    assert
      .dom(
        `[data-test-category-dropdown-item="${firstCategoryWithTopics.entityUrn}"]`
      )
      .hasText(
        `${firstCategoryWithTopics.name} (${topicsForCategoryCount})`,
        "The first category dropdown option has the expected count"
      );

    await click(
      `[data-test-category-dropdown-item="${firstCategoryWithTopics.entityUrn}"]`
    );

    await click("[data-test-category-dropdown-trigger]");

    assert
      .dom(
        `[data-test-category-dropdown-item="${firstCategoryWithTopics.entityUrn}"] .discover__selected-category-name`
      )
      .exists(
        "The selected css class is applied to the expected category dropdown item"
      );
    assert
      .dom("[data-test-category-dropdown-trigger]")
      .hasText(
        firstCategoryWithTopics.name,
        "The selected category name is now displayed in the dropdown trigger"
      );
    assert
      .dom("[data-test-topic-card]")
      .exists(
        { count: topicsForCategoryCount },
        "The number of topic cards matches the number displayed in the first topics dropdown option"
      );
    assert.equal(
      currentURL(),
      `/discover?category=${fromUrn(firstCategoryWithTopics.entityUrn).id}`,
      "The category query param has the expected value"
    );
  });

  module("ats.ramp.elevate-web.discover", function(hooks) {
    hooks.beforeEach(function() {
      this.locationReplaceSpy = this.sandbox.spy(
        browserGlobals.window.location,
        "replace"
      );
    });

    test("User is redirected to the legacy index page when ats.ramp.elevate-web.discover is not enabled", async function(assert) {
      assert.expect(1);
      this.setupLixes({
        "ats.ramp.elevate-web.discover": "control"
      });

      await visit("/discover");

      assert.equal(
        this.locationReplaceSpy.args[0][0],
        "https://www.linkedin-ei.com/leap/discover"
      );
    });
  });
});
