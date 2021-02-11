[![New Relic Experimental header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Experimental.png)](https://opensource.newrelic.com/oss-category/#new-relic-experimental)

# nr-bulktagger 

> This nodejs project is a command line utility for performing bulk tagging of newrelic guid entities.  
  Currently it only supports adding tags.  

## Installation

>  install required modules:  npm install

## Getting Started
> This utility requres 2 things:  
  1 .  A NewRelic admin api key,  please place this value into the file api_key.txt located in the root directory.
  2.  A list of entity guids you want to add a tag to.   Please place this list of guids into the file entity_guid_list.txt.
      For the format, please see the file entity_guid_example.txt.   
	  
	When running the application, it requies 2 arguments, the desired tag key and value.  
    e.g
         node index.js  [tag-key] [tag-value]   
		 
	The utility will tag each guid in the list provided, and the result of the tagging will show in the console output.

## Support

New Relic hosts and moderates an online forum where customers can interact with New Relic employees as well as other customers to get help and share best practices. Like all official New Relic open source projects, there's a related Community topic in the New Relic Explorers Hub. You can find this project's topic/threads here:

>Add the url for the support thread here

## Contributing
We encourage your contributions to improve [project name]! Keep in mind when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project.
If you have any questions, or to execute our corporate CLA, required if your contribution is on behalf of a company,  please drop us an email at opensource@newrelic.com.

**A note about vulnerabilities**

As noted in our [security policy](../../security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

## License
[Project Name] is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.
>[If applicable: The [project name] also uses source code from third-party libraries. You can find full details on which libraries are used and the terms under which they are licensed in the third-party notices document.]
