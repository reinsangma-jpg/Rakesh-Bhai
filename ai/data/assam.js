const assamData = [
  {
    id:"assam-001",
    question:"What is the capital of Assam?",
    aliases:["capital of assam","assam capital","what's assam capital","capital assam"],
    keywords:["assam","capital","dispur"],
    answer:"The capital of **Assam** is **Dispur**.",
    category:"Assam",
    sourceId:"WIKI",
    confidence:1
  },
  {
    id:"assam-002",
    question:"What is the largest city in Assam?",
    aliases:["largest city of assam","biggest city assam","main city in assam"],
    keywords:["assam","largest","city","guwahati"],
    answer:"The largest city in Assam is **Guwahati** (a major urban and transport hub on the Brahmaputra).",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.95
  },
  {
    id:"assam-003",
    question:"Which river is most important in Assam?",
    aliases:["main river of assam","assam major river","big river in assam"],
    keywords:["assam","river","brahmaputra"],
    answer:"The **Brahmaputra River** is the most important and defining river system in Assam.",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.95
  },
  {
    id:"assam-004",
    question:"What is Kaziranga National Park famous for?",
    aliases:["kaziranga famous for","why kaziranga is famous","kaziranga rhino"],
    keywords:["kaziranga","national","park","one-horned","rhinoceros"],
    answer:"**Kaziranga National Park** is especially famous for the **Indian one-horned rhinoceros** and its wetland-grassland ecosystem.",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.95
  },
  {
    id:"assam-005",
    question:"Where is Kaziranga National Park located?",
    aliases:["kaziranga location","kaziranga is in which district","where is kaziranga"],
    keywords:["kaziranga","assam","location"],
    answer:"**Kaziranga National Park** is located in Assam, in the **Brahmaputra floodplain** region.",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.85
  },
  {
    id:"assam-006",
    question:"What are the major festivals of Assam?",
    aliases:["assam festivals","main festival in assam","bihu festival"],
    keywords:["assam","festival","bihu"],
    answer:"Assam is well-known for **Bihu** festivals (such as Rongali/Bohag Bihu), which celebrate seasonal and agricultural cycles.",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.9
  },
  {
    id:"assam-007",
    question:"Why is Assam famous for tea?",
    aliases:["assam tea famous why","tea in assam","assam tea"],
    keywords:["assam","tea","plantations"],
    answer:"Assam is famous for tea because it has large tea-growing regions and produces strong, malty **Assam tea**.",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.9
  },
  {
    id:"assam-008",
    question:"What is the official language of Assam?",
    aliases:["assam official language","language of assam","assam state language"],
    keywords:["assam","official","language","assamese"],
    answer:"**Assamese** is the official language of Assam (with additional recognized languages in specific contexts).",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.85
  },
  {
    id:"assam-009",
    question:"What is Assam’s state animal?",
    aliases:["assam state animal","state animal of assam"],
    keywords:["assam","state","animal","rhinoceros"],
    answer:"Assam’s state animal is the **Indian one-horned rhinoceros**.",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.9
  },
  {
    id:"assam-010",
    question:"What is Assam’s state bird?",
    aliases:["assam state bird","state bird of assam"],
    keywords:["assam","state","bird","wood","duck"],
    answer:"Assam’s state bird is the **white-winged wood duck**.",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.85
  },
  {
    id:"assam-011",
    question:"What is Majuli?",
    aliases:["majuli island","tell me about majuli","what is majuli in assam"],
    keywords:["majuli","river","island","brahmaputra"],
    answer:"**Majuli** is a major **river island** in the Brahmaputra River, known for Vaishnavite cultural traditions and satras.",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.85
  },
  {
    id:"assam-012",
    question:"Which UNESCO World Heritage Sites are in Assam?",
    aliases:["unesco sites in assam","assam world heritage"],
    keywords:["assam","unesco","kaziranga","manas"],
    answer:"Assam includes UNESCO World Heritage Sites such as **Kaziranga National Park** and **Manas Wildlife Sanctuary**.",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.85
  },
  {
    id:"assam-013",
    question:"What is Manas Wildlife Sanctuary known for?",
    aliases:["manas sanctuary known for","manas wildlife assam"],
    keywords:["manas","wildlife","sanctuary","assam"],
    answer:"**Manas Wildlife Sanctuary** is known for biodiversity in the Himalayan foothills and conservation of rare species.",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.8
  },
  {
    id:"assam-014",
    question:"Which countries does Assam border?",
    aliases:["assam international border","does assam border bangladesh","assam border countries"],
    keywords:["assam","border","bhutan","bangladesh"],
    answer:"Assam has international borders with **Bhutan** and **Bangladesh** (and borders several Indian states).",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.85
  },
  {
    id:"assam-015",
    question:"Which Indian states border Assam?",
    aliases:["assam bordering states","assam borders which states"],
    keywords:["assam","borders","arunachal","nagaland","meghalaya"],
    answer:"Assam borders multiple states, including **Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, Meghalaya,** and **West Bengal**.",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.85
  },
  {
    id:"assam-016",
    question:"What is Muga silk?",
    aliases:["muga silk assam","assam silk muga","what is muga"],
    keywords:["muga","silk","assam"],
    answer:"**Muga silk** is a famous golden-colored silk strongly associated with Assam’s traditional textiles.",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.8
  },
  {
    id:"assam-017",
    question:"What type of climate does Assam have?",
    aliases:["assam climate","weather in assam generally","assam monsoon climate"],
    keywords:["assam","climate","monsoon","humid"],
    answer:"Assam generally has a **humid, monsoon-influenced** climate with significant seasonal rainfall.",
    category:"Assam",
    sourceId:"IMD",
    confidence:0.75
  },
  {
    id:"assam-018",
    question:"What is the significance of the Brahmaputra floodplain in Assam?",
    aliases:["brahmaputra floodplain assam","floods in assam why"],
    keywords:["brahmaputra","floodplain","assam","floods"],
    answer:"The Brahmaputra floodplain supports fertile agriculture and wetlands, but it also makes Assam prone to **seasonal flooding**.",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.8
  },
  {
    id:"assam-019",
    question:"What is Bihu dance?",
    aliases:["bihu dance assam","assam bihu dance"],
    keywords:["bihu","dance","assam"],
    answer:"**Bihu dance** is a traditional Assamese dance closely tied to Bihu festivals and seasonal celebrations.",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.85
  },
  {
    id:"assam-020",
    question:"What is Sattriya?",
    aliases:["sattriya dance","assam classical dance sattriya"],
    keywords:["sattriya","dance","assam","classical"],
    answer:"**Sattriya** is a classical Indian dance form that developed in Assam’s Vaishnavite monasteries (satras).",
    category:"Assam",
    sourceId:"WIKI",
    confidence:0.8
  },
];

export default assamData;
