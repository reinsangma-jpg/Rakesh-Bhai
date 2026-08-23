const intents = {
  conversation: [
    { intent:"HELLO", re: "^(hi|hello|hey|yo|good morning|good evening|good afternoon)\\b" },
    { intent:"THANKS", re: "^(thanks|thank you|thx)\\b" },
    { intent:"BYE", re: "^(bye|goodbye|see you|good night)\\b" },
    { intent:"HOW_ARE_YOU", re: "^(how are you|how r u|howre you)\\b" },
    { intent:"WHAT_CAN_YOU_DO", re: "^(what can you do|help|commands)\\b" },
    { intent:"SUBJECTS", re: "^(what subjects|what do you know|knowledge categories)\\b" }
  ],
  commands: [
    { intent:"START_QUIZ", re: "\\b(start|give|begin)\\b.*\\bquiz\\b|\\bquiz me\\b" },
    { intent:"STOP_QUIZ", re: "\\b(stop|end|quit|exit)\\b.*\\bquiz\\b|\\bstop quiz\\b" }
  ]
};
export default intents;
