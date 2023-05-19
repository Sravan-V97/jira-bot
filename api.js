const axios = require("axios");

const apiClient = axios.create({
  baseURL: "https://testwwf.atlassian.net/rest/api/2",
  headers: {
    Authorization: `Basic ${Buffer.from(
      "haxec29831@dekaps.com:ATATT3xFfGF0Qqt4UW5cZ6R2kvunxDV6pjPQ2B6Jl0E1Q5cu-yUcw9fOC0NPl5pVHrFb-v4cJoNsGUSlMtG_ofN8tEkjNKyYFHsTceeFxBCjoUW5JUziziv_dWclkVw8xzQYhuOuJulTmU1cWIuUSZswUF_6ENLkkRWSiCv5rF-JWDMxeQhRx-M=5023EE04"
    ).toString("base64")}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

async function createJiraIssue(issueData) {
  try {
    const response = await apiClient.post("/issue", issueData);
    return response.data;
  } catch (error) {
    console.error("Error creating Jira issue:", error.response);
    throw new Error("Internal Server Error");
  }
}

module.exports = { createJiraIssue };
