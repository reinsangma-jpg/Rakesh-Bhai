import rules from "./rules.js";
import corrections from "./corrections.js";
import sources from "./sources.js";
import responses from "./responses.js";
import intents from "./intents.js";
import entities from "./entities.js";
import safety from "./safety.js";
import current from "./current.js";

import conversationData from "./conversation.js";
import selfData from "./self.js";
import quizBank from "./quiz.js";

// Knowledge categories (starter pack)
import assamData from "./assam.js";
import northeastData from "./northeast.js";
import indiaData from "./india.js";
import worldData from "./world.js";
import geographyData from "./geography.js";
import climatologyData from "./climatology.js";
import agricultureData from "./agriculture.js";
import programmingData from "./programming.js";

const knowledgeModules = [
  { name:"Assam", data: assamData },
  { name:"Northeast India", data: northeastData },
  { name:"India", data: indiaData },
  { name:"World", data: worldData },
  { name:"Geography", data: geographyData },
  { name:"Climatology", data: climatologyData },
  { name:"Agriculture", data: agricultureData },
  { name:"Programming", data: programmingData },
  // Add new modules here later:
  // import musicData from "./music.js";
  // knowledgeModules.push({ name:"Music", data: musicData });
];

export default {
  rules,
  corrections,
  sources,
  responses,
  intents,
  entities,
  safety,
  current,

  conversationData,
  selfData,
  quizBank,

  knowledgeModules,
};
