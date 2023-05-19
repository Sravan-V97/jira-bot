require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const axios = require("axios");
const eventsApi = require("@slack/events-api");
const { WebClient, LogLevel } = require("@slack/web-api");
const { createJiraIssue } = require("./api");
const { createModal } = require("./modals");
const app = express();
const PORT = process.env.PORT || 3000;

// const bodyParser = require("body-parser");
// const { json } = require("body-parser");
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

const token = process.env.BOT_TOKEN;
const slackEvents = eventsApi.createEventAdapter(process.env.SIGNING_SECRET);
const client = new WebClient(token, {
  logLevel: LogLevel.DEBUG,
});

const eventMessage = {
  issue_created: "The below issue has been created",
  issue_updated: "The below issue has been updated",
  issue_deleted: "The below issue has been deleted",
};

// Create a new Jira issue for every message posted in channel

/*app.use("/", slackEvents.expressMiddleware());
slackEvents.on("message", async (event) => {
  if (!event.subtype && !event.bot_id) {
    const issueData = {
      fields: {
        project: {
          key: "TROOP",
        },
        summary: event.text,
        issuetype: {
          id: "10001",
        },
      },
    };

    const response = await createJiraIssue(issueData);
    if (response) {
      client.chat.postMessage({
        token,
        channel: event.channel,
        thread_ts: event.ts,
        text: `JIRA issue has been created under the name ${event.text}`,
      });
    }
  }
});*/

// Create Jira issue with slash command (/test)
app.post("/slack/command", async (req, res) => {
  try {
    const { text, channel_id } = req.body;
    const issueData = {
      fields: {
        project: {
          key: "TROOP",
        },
        summary: text,
        issuetype: {
          id: "10001",
        },
      },
    };

    const response = await createJiraIssue(issueData);
    if (response) {
      res.status(200).json({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `JIRA issue has been created with below details\n\nId: ${response.key}\nName: ${text}`,
            },
          },
        ],
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// Create message shortcut that will open a modal to create issue
app.post("/slack/create-issue", async (req, res) => {
  const data = JSON.parse(req.body.payload);

  client.views.open({
    trigger_id: data.trigger_id,
    view: createModal,
  });

  if (data.type == "view_submission") {
    const text =
      data.view.state.values.issue_name.plain_text_input_action.value;
    const issueData = {
      fields: {
        project: {
          key: "TROOP",
        },
        summary: text,
        issuetype: {
          id: "10001",
        },
      },
    };

    const response = await createJiraIssue(issueData);
    if (response) {
      const successModal = {
        type: "modal",
        title: {
          type: "plain_text",
          text: "Jira Slackbot",
          emoji: true,
        },
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "Your Jira issue has been created successfully :white_check_mark:",
              emoji: true,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `*Issue Id* : ${response.key}`,
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `*Issue Name* : ${text}`,
              },
            ],
          },
        ],
      };
      client.views.update({
        view_id: data.view.id,
        view: successModal,
      });
    }
  }
});

// Post a message for every new issue created in Jira
app.post("/slack/jira-hook", async (req, res) => {
  const url =
    "https://hooks.slack.com/services/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";
  const data = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${
            eventMessage[req.body.issue_event_type_name]
          } in Jira:\n\n *Issue Id: ${req.body.issue.key}*\n*Issue Name: ${
            req.body.issue.fields.summary
          }*`,
        },
      },
    ],
  };

  axios
    .post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log("Request sent successfully");
    })
    .catch((error) => {
      console.error("Error sending request:", error);
    });
});

app.listen(PORT, () => {
  console.log(`listening on port http://localhost:${PORT}`);
});
