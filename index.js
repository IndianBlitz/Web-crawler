// defined required values
const express = require('express');
const cors = require("cors");
const request =require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const json2csv = require("json2csv").Parser;
const axios = require('axios');
const bodyParser = require('body-parser');

const { gzip } = require('zlib');

const puppeteer = require('puppeteer');


// Elements
const app = express();
const PORT =process.env.PORT ||  4050;
app.use(bodyParser.json());

// const BASE_URL = process.env.BASE_URL;

//  console.log(BASE_URL);

// const site_urls = ["https://medium.com/@dimillian/the-making-of-ice-cubes-an-open-source-swiftui-mastodon-client-45ebea5cf6b6"
// ,"https://medium.com/@dnastacio/rewriting-the-largest-system-in-the-world-25edc454e569",
// "https://medium.com/@markaherschberg/teach-your-kids-to-program-but-dont-teach-them-to-be-programmers-420bbfdf5188",

// ];


let site_urls  =[]

const medium_latest_url = "https://blog.medium.com/latest"

app.use(cors({
    origin: '*'
}));


// ----------------------------------------------------------------------------------------------------------------
const userId = '1d661c0be8b5af773190a79093df07f125c535a23a67d94f9829611d9628b6faf';
const token = '2b1684b835408c07bad303535f04c62b73fc26171df19f68fac5217f6445823e0';









var urls = [];


request('https://blog.medium.com/latest', (error, response, html) => {
  if (!error && response.statusCode == 200) {
    const $ = cheerio.load(html);
    $('div.postArticle-content a').each((i, elem) => {
      const href = $(elem).attr('href');
      urls.push(href);
      
    });

	app.get('/api2', (req, res)=>{
		let uniqueUrls = [...new Set(urls)];
		res.json(uniqueUrls)
		
		
		
	});
  }
});





// (async () => {
// 	const browser = await puppeteer.launch();
// 	const page = await browser.newPage();
// 	await page.goto('https://blog.medium.com/latest');
	
// 	// Scroll down to trigger infinite scrolling
// 	await page.evaluate(() => {
// 	  window.scrollTo(0, document.body.scrollHeight);
// 	});
  
// 	// Wait for new articles to load
// 	await page.waitForSelector('div.postArticle');
  
// 	// Extract the URLs of the articles
// 	const urls = await page.evaluate(() => {
// 	  const articles = Array.from(document.querySelectorAll('div.postArticle'));
// 	  return articles.map(article => article.querySelector('a').href);
// 	});
  
// 	console.log(urls);
  
// 	await browser.close();
//   })();

















app.get('/api/data', (req, res) => {
	// handle GET request for /api/data endpoint
	res.send('Hello, world!');
  });




  const medium= [];


  function GetAuthurName(str){
	  let text = str;
	  let result = text.substring(0, text.indexOf("Follow") + 6).replace("Follow", "");
	  
  return result;
  
  }
  




  app.post('/api/data', (req, res) => {
	
		site_urls  =req.body.urlArray;
		// console.log(site_urls);
		res.send({ success: true });



		( async() =>{
			let medium_data = [];
		
		
			for(let site_url of site_urls){
				// console.log(site_url)
				const response  = await request({
					uri:site_url,
					headers:{
						"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
						"accept-encoding": "gzip, deflate, br",
						"accept-language": "en-US,en;q=0.8"
					},
					gzip:true,
				});
			
				let $ = cheerio.load(response)
				
		
			
				let Title_of_blog =$('div[class=""] > h1.pw-post-title').text();
				
				  let Author_Name =GetAuthurName( $('.ab.q').text());
				
				  let Author_Bio =$("p.bd").text();
		
				let Url_of_site = site_url;
				  
				let Author_img_src = $('div.l.di > img').attr('src');
		
				
			
			  medium_data.push({
				Title_of_blog,
				Author_Name,
				Author_Bio,
				Url_of_site ,
				Author_img_src,
			  });
		
			}
			
		
			const j2cp = new json2csv();
			const csv = j2cp.parse(medium_data);
		
			fs.writeFileSync("./medium.csv",csv,"utf-8");
			medium.push(medium_data);
		}
		
		) ();









  });
  







//-----------------------------------------------------------------------------------------------------------------------











app.get(`/get-cvs`,function(req,res){

	const j2cp = new json2csv();
	const csv = j2cp.parse(medium);

	res.attachment("medium.csv");
	res.status(200).send(csv);
})






app.get('/api', (req, res)=>{
	res.json({medium})
	
	
});

app.listen(PORT, (error) =>{
	if(!error)
		console.log("Server is Successfully Running, and App is listening on port "+ PORT)
else
		console.log("Error occurred, server can't start", error);
	}
);
