const quizBank = [
  { id:"quiz-001", category:"Assam", question:"What is the capital of Assam?", choices:["Dispur","Guwahati","Shillong","Kohima"], correctIndex:0, explanation:"Dispur is the capital of Assam.", sourceId:"WIKI" },
  { id:"quiz-002", category:"India", question:"What is the capital of India?", choices:["Mumbai","New Delhi","Kolkata","Chennai"], correctIndex:1, explanation:"New Delhi is the capital of India.", sourceId:"WIKI" },
  { id:"quiz-003", category:"Geography", question:"What is latitude?", choices:["Distance east/west of Prime Meridian","Distance north/south of Equator","Height above sea level","A map symbol"], correctIndex:1, explanation:"Latitude measures north/south distance from the Equator.", sourceId:"WIKI" },
  { id:"quiz-004", category:"Climatology", question:"Weather vs climate: climate is…", choices:["Minute-to-minute conditions","Long-term average patterns","Only rainfall","Only temperature"], correctIndex:1, explanation:"Climate describes long-term patterns/averages.", sourceId:"WIKI" },
  { id:"quiz-005", category:"Agriculture", question:"Crop rotation mainly helps to…", choices:["Reduce soil nutrients","Improve soil health and reduce pests","Stop irrigation","Increase erosion"], correctIndex:1, explanation:"Rotating crops improves soil and breaks pest cycles.", sourceId:"FAO" },
  { id:"quiz-006", category:"Programming", question:"In JavaScript, which keyword declares a block-scoped variable?", choices:["var","let","constantly","static"], correctIndex:1, explanation:"`let` is block-scoped; `const` is also block-scoped but constant binding.", sourceId:"WIKI" },
  { id:"quiz-007", category:"Geography", question:"What is a delta?", choices:["A desert wind","A landform at a river mouth","A mountain type","A sea current"], correctIndex:1, sourceId:"WIKI" },
  { id:"quiz-008", category:"India", question:"India’s currency is…", choices:["Dollar","Rupee","Yen","Euro"], correctIndex:1, sourceId:"WIKI" },
  { id:"quiz-009", category:"Climatology", question:"Greenhouse gases primarily affect…", choices:["Earth’s outgoing heat","Earth’s gravity","Plate tectonics","Ocean salinity only"], correctIndex:0, sourceId:"WIKI" },
  { id:"quiz-010", category:"Assam", question:"Kaziranga is famous for…", choices:["Snow leopards","One-horned rhinoceros","Polar bears","Kangaroos"], correctIndex:1, sourceId:"WIKI" },

  { id:"quiz-011", category:"Programming", question:"Which is an Array method in JavaScript?", choices:["push()","grow()","appendall()","stackify()"], correctIndex:0, sourceId:"WIKI" },
  { id:"quiz-012", category:"Agriculture", question:"Irrigation means…", choices:["Removing weeds","Adding water to crops/fields","Adding only fertilizer","Harvesting early"], correctIndex:1, sourceId:"FAO" },
  { id:"quiz-013", category:"Geography", question:"The Prime Meridian passes through…", choices:["Paris","Greenwich (London)","Rome","New York"], correctIndex:1, sourceId:"WIKI" },
  { id:"quiz-014", category:"Climatology", question:"Monsoon is mainly a…", choices:["Ocean current","Seasonal wind and rainfall pattern","Earthquake type","Cloud type"], correctIndex:1, sourceId:"IMD" },
  { id:"quiz-015", category:"India", question:"Republic Day in India is on…", choices:["15 Aug","26 Jan","2 Oct","14 Nov"], correctIndex:1, sourceId:"WIKI" },

  { id:"quiz-016", category:"Assam", question:"Majuli is known as a…", choices:["Glacier","River island in the Brahmaputra","Volcano","Coral reef"], correctIndex:1, sourceId:"WIKI" },
  { id:"quiz-017", category:"Programming", question:"What does JSON stand for?", choices:["Java Source Object Notation","JavaScript Object Notation","Joined Script Object Node","Java Syntax Over Network"], correctIndex:1, sourceId:"WIKI" },
  { id:"quiz-018", category:"Geography", question:"Population density is…", choices:["People per unit area","Total population only","Area per person only","Birth rate"], correctIndex:0, sourceId:"WIKI" },
  { id:"quiz-019", category:"Agriculture", question:"A legume crop (like beans) can help soil by…", choices:["Fixing nitrogen","Removing oxygen","Creating salt","Stopping rainfall"], correctIndex:0, sourceId:"FAO" },
  { id:"quiz-020", category:"Climatology", question:"Humidity refers to…", choices:["Air pressure","Amount of water vapor in the air","Wind speed","UV radiation"], correctIndex:1, sourceId:"WIKI" },
];

export default quizBank;
