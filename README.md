[![New Relic Experimental header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Experimental.png)](https://opensource.newrelic.com/oss-category/#new-relic-experimental)

# nr-bulktagger 

> This nodejs project is a command line utility for performing bulk tagging of newrelic guid entities.  
  Currently it supports 3 operations: 
  * adding a single tag from a list of guids(file)
  * deleting a single tag from a list of guids(file)
  * adding any number of tags to a list of guids, all defined in a simple csv (see example format). 

## Installation

>  install required modules:  npm install

## Getting Started
> This utility requres 2 things:  
  1 .  A NewRelic admin api key,  please place this value into the file api_key.txt located in the root directory.
  
  2.  An input file.  
  
      For adding/deleting a single tag to a list of guids,  the file should only contain a list of guids, nothing else.
      Please place this list of guids into the file entity_guid_list.txt.  For an example, see the file entity_guid_example.txt   
	  
	  For adding multiple tags to a list guids, the file needs to be in csv format. 
	  The csv file must be called entity_guid_list.csv.
      For an example please see the file entity_guild_example.csv
	  
	 here are examples of all 3 supported commands: 
	  
     add key:   node index.js add customkey:customvalue   
	 
	 delete key: node index.js delete customkey
	 
	 add tags by csv: node index.js. addcsv 
	 
	The utility will execute the command, and
	the result of the tagging will show in the console output.

## Support

New Relic hosts and moderates an online forum where customers can interact with New Relic employees as well as other customers to get help and share best practices. Like all official New Relic open source projects, there's a related Community topic in the New Relic Explorers Hub. You can find this project's topic/threads here:


## Contributing
We encourage your contributions to improve nr-bulktagger! Keep in mind when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project.
If you have any questions, or to execute our corporate CLA, required if your contribution is on behalf of a company,  please drop us an email at opensource@newrelic.com.

**A note about vulnerabilities**

As noted in our [security policy](../../security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

## License
nr-bulktagger is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.
>[If applicable: The nr-bulktagger also uses source code from third-party libraries. You can find full details on which libraries are used and the terms under which they are licensed in the third-party notices document.]
