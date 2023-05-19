const createModal = {
  type: "modal",
  title: {
    type: "plain_text",
    text: "Jira Slackbot",
    emoji: true,
  },
  submit: {
    type: "plain_text",
    text: "Submit",
    emoji: true,
  },
  close: {
    type: "plain_text",
    text: "Cancel",
    emoji: true,
  },
  blocks: [
    {
      type: "input",
      block_id: "issue_name",
      element: {
        type: "plain_text_input",
        action_id: "plain_text_input_action",
        placeholder: {
          type: "plain_text",
          text: "Enter the issue name",
          emoji: true,
        },
      },
      label: {
        type: "plain_text",
        text: "Issue Name",
        emoji: true,
      },
    },
  ],
};

module.exports = { createModal };
