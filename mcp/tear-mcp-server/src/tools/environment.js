const os = require("os");
const { execSync } = require("child_process");


function getNodeVersion() {

  try {

    return execSync("node -v")
      .toString()
      .trim();

  } catch {

    return "unknown";

  }

}


function getGitStatus() {

  try {

    execSync(
      "git rev-parse --is-inside-work-tree"
    );

    return true;

  } catch {

    return false;

  }

}


function environmentStatus() {

  return {

    project: "TEAR",

    environment: "local",

    mcp_status: "online",

    node_version: getNodeVersion(),

    platform: os.platform(),

    repository: getGitStatus()

  };

}


module.exports = {

  environmentStatus

};