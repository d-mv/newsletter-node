const axios = require("axios");
const parser = require("fast-xml-parser");
const he = require("he");

module.exports.parsing = url => {
  const parseResponse = response => {
    const xmlData = response.data;
    var options = {
      attributeNamePrefix: "@_",
      attrNodeName: "attr", //default is 'false'
      textNodeName: "#text",
      ignoreAttributes: true,
      // ignoreAttributes: false,
      ignoreNameSpace: false,
      // ignoreNameSpace: true,
      allowBooleanAttributes: false,
      parseNodeValue: true,
      parseAttributeValue: false,
      trimValues: true,
      // trimValues: false,
      cdataTagName: "__cdata", //default is 'false'
      cdataPositionChar: "\\c",
      localeRange: "", //To support non english character in tag/attribute values.
      parseTrueNumberOnly: false,
      attrValueProcessor: a => he.decode(a, { isAttributeValue: true }), //default is a=>a
      tagValueProcessor: a => he.decode(a) //default is a=>a
    };

    if (parser.validate(xmlData) === true) {
      //optional (it'll return an object in case it's not valid)
      var jsonObj = parser.parse(xmlData, options);
    }

    // Intermediate obj
    var tObj = parser.getTraversalObj(xmlData, options);
    var jsonObj = parser.convertToJson(tObj, options);
    console.log(jsonObj);
    return jsonObj;
  };
  let respo = "";
  axios
    .get(url)
    .then(res => {
      console.log("success");
      respo = res;
    })
    .catch(err => {
      console.log("error");
    })
    .then(() => {
      console.log("then result:");
      // console.log(parseResponse(respo));
      return parseResponse(respo);
    });
};
