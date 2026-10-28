/**
 * Installs Apache JMeter (a Java Swing desktop app) on Linux, adds a Thread Group
 * from the right-click menu, sets it to 5 threads and checks the value was kept.
 */
import { describe, expect, it } from "vitest";
import { TestDriver } from "testdriverai/vitest/hooks";

describe("Apache JMeter (Java Swing)", () => {
  it("adds a Thread Group and sets it to 5 threads", async (context) => {
    const testdriver = TestDriver(context);

    // Install a Java runtime and unpack the JMeter release.
    await testdriver.exec(
      "sh",
      "sudo apt-get update -qq && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq default-jre >/dev/null",
      600000,
    );
    await testdriver.exec(
      "sh",
      "curl -fsSL -o /tmp/jmeter.tgz https://dlcdn.apache.org/jmeter/binaries/apache-jmeter-5.6.3.tgz && tar -xzf /tmp/jmeter.tgz -C /tmp",
      300000,
    );

    // Start the replay recording, then launch the app.
    await testdriver.provision.dashcam({ title: "Apache JMeter (Java Swing) Thread Group", webLogs: false });
    await testdriver.exec("sh", "cd /tmp && nohup /tmp/apache-jmeter-5.6.3/bin/jmeter >/tmp/jmeter.log 2>&1 &", 10000);

    // Wait for the main window, then right-click Test Plan.
    const testPlan = await testdriver.find(
      "the Test Plan item at the top of the tree on the left side of the Apache JMeter window",
      { timeout: 90000 },
    );
    await testPlan.rightClick();

    // Add > Threads (Users) > Thread Group.
    await testdriver.find("the Add item at the top of the right-click menu").click();
    await testdriver.find("the Threads (Users) item in the Add submenu").click();
    await testdriver.find("the Thread Group item in the Threads (Users) submenu").click();

    // Change Number of Threads from 1 to 5.
    await testdriver.find("the Number of Threads (users) text field showing 1 in the Thread Properties section").click();
    await testdriver.pressKeys(["ctrl", "a"]);
    await testdriver.type("5");

    // Click away and back to make sure the value is kept.
    await testdriver.find("the Test Plan item at the top of the tree on the left side of the Apache JMeter window").click();
    await testdriver.find("the Thread Group item under Test Plan in the tree on the left").click();

    // Wait for the panel, then check the saved value.
    await testdriver.find("the Number of Threads (users) text field showing 5 in the Thread Properties section", {
      timeout: 15000,
    });
    const saved = await testdriver.assert(
      "the JMeter window shows the Thread Group settings panel with the Number of Threads (users) field set to 5",
    );
    expect(saved).toBeTruthy();

    // Hold the final screen so the end of the replay shows the result.
    await testdriver.wait(3000);
  });
});
