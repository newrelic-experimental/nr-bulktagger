
var axios = require('axios');
const csvreader = require('csv-parser');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const guid_list_cache = [];

var headers_cache = [];

//if (process.argv.length < 4) {
//   console.log("not enough arguments, please include an action(add/delete) and  a key:value (in that format with a colon")
//   return;
//}

const ACTION = process.argv[2].toLowerCase().trim();
const TAG_KEY_VALUE = process.argv[3];
var TAG_KEY = "";
var TAG_VALUE = "";

if (ACTION === 'add') {
    var parts = TAG_KEY_VALUE.split(":");
    if (parts.length != 2) {
        console.log("Error parsing tag key or value, please format as:    tagkey:tagvalue")
        return;
    }
    else {

        TAG_KEY = parts[0];
        TAG_VALUE = parts[1];
        console.log("Performing Tag Add Action: " + TAG_KEY + " : " + TAG_VALUE);
    }
}
else if (ACTION === 'delete') {
    // for delete we only expect a key.
    console.log("Performing Tag Delete Action: " + TAG_KEY);
    TAG_KEY = TAG_KEY_VALUE;
}
else if (ACTION === 'addcsv') {
    console.log("Performing Tag Add Tags per CSV file, looking for entity_guid_list.csv"
    // were ok.. look for csv file (todo) 
}
else {
    console.log("Error, invalid action,  valid actions are :  add or delete")
    return;
}


var API_KEY = "";
// fetch apk key from file called api_key.txt

try {
    if (fs.existsSync('api_key.txt')) {
        const data = fs.readFileSync('api_key.txt', 'utf8');
        API_KEY = data.replace(/(\r\n|\n|\r)/gm, "");// remove /r/n
        console.log("APIKEY FOUND: " + API_KEY);
    }
    else {
        console.log("api_key.txt file is not found, please check");
        return;
    }


    if (API_KEY.length <= 0) {
        console.log("invalid api key, please check file");
        return;
    }
} catch (err) {
    console.error(err)
}

console.log("=======================================");

// version 2... tags are in the guid list file... 
if (ACTION == 'addcsv') {

    try {

        const file = readline.createInterface({
            input: fs.createReadStream('entity_guid_list.csv'),
            output: process.stdout,
            terminal: false
        });

        var sendcount = 0;
        var linecount = 0;
        console.log("Processing GUID CSV TAGS file...");

        // file.line

        var headers_cache
        file.on('line', (line) => {

            if (linecount <= 0) {
                // assume header/,, store. 
                headers_cache = line.split(",");
                for (var i = 0; i < headers_cache.length; i++) {
                    headers_cache[i] = headers_cache[i].trim(); //remove all spaces 
                }
            }
            else {
                sendcount++;
                var consolelogline = sendcount;

                var parts = line.split(",");
                var values = []
                for (var k = 0; k < parts.length; k++) {
                    values[k] = parts[k].trim();
                }
                var guidval = values[0];
                consolelogline += ":   " + guidval;

                datapayload = JSON.stringify({
                    query: `mutation ($guidval: EntityGuid!, $tag_key1: String!, $tag_value1: String!,  $tag_key2: String!, $tag_value2: String! ) {
    taggingAddTagsToEntity(guid: $guidval,tags: [{ key: $tag_key1, values: [$tag_value1]}, { key: $tag_key2, values: [$tag_value2]}]) {
            errors {
                message
            }
        }
     }`,
                    variables: { "guidval": guidval, "tag_key1": headers_cache[1], "tag_value1": values[1], "tag_key2": headers_cache[2], "tag_value2": values[2] }
                });

                var config = {
                    method: 'post',
                    url: 'https://api.newrelic.com/graphql',
                    headers: {
                        'Content-Type': 'application/json',
                        'API-Key': API_KEY
                    },
                    data: datapayload
                };

                axios(config)
                    .then(function (response) {
                        if (response.status == 200) {
                            consolelogline += "   ===>  success"
                        }
                        else {
                            consolelogline += " failed"
                        }
                        console.log(consolelogline);
                        //  console.log(JSON.stringify(response.data));
                    })
                    .catch(function (error) {
                        consolelogline += " exception";
                        console.log(consolelogline);
                        //console.log("exception: " + error);
                    });
            }
            linecount++;

        });

    } catch (ex1) {
        console.log("Caught Exception during csv processing/sending: " + ex1);
    }

}
else if (ACTION == 'add' || ACTION == 'delete') {  //  Line by line,,, guid only way  v1 
    const file = readline.createInterface({
        input: fs.createReadStream('entity_guid_list.txt'),
        output: process.stdout,
        terminal: false
    });


    var sendcount = 0;

    console.log("Processing GUID file...");

    file.line

    file.on('line', (line) => {

        sendcount++;
        var consolelogline = sendcount;
        var guidval = line.trim()
        consolelogline += ":   " + guidval;

        var datapayload = "";

        if (ACTION === 'add') {
            datapayload = JSON.stringify({
                query: `mutation ($guidval: EntityGuid!, $tag_key: String!, $tag_value: String!) {
        taggingAddTagsToEntity(guid: $guidval,tags: { key: $tag_key, values: [$tag_value]}) {
                errors {
                    message
                }
            }
         }`,
                variables: { "guidval": guidval, "tag_key": TAG_KEY, "tag_value": TAG_VALUE }
            });
        }
        else {
            datapayload = JSON.stringify({
                query: `mutation ($guidval: EntityGuid!, $tag_key: String!, $tag_value: String!) {
        taggingDeleteTagsToEntity(guid: $guidval,tagKeys:  $tag_key) {
                errors {
                    message
                }
            }
         }`,
                variables: { "guidval": guidval, "tag_key": TAG_KEY }
            });
        }

        var config = {
            method: 'post',
            url: 'https://api.newrelic.com/graphql',
            headers: {
                'Content-Type': 'application/json',
                'API-Key': API_KEY
            },
            data: datapayload
        };

        axios(config)
            .then(function (response) {
                if (response.status == 200) {
                    consolelogline += "   ===>  success"
                }
                else {
                    consolelogline += " failed"
                }
                console.log(consolelogline);
                //  console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
                consolelogline += " exception";
                console.log(consolelogline);
                //console.log("exception: " + error);
            });
    });


    file.on('close', () => {

        // console.log("Bulk tag processing is complete." + sendcount + " items");
    });


}
