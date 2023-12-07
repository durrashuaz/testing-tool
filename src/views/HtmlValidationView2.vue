<template>
	<form class="html-validator__form">
		<label for="url">Site:</label><br>
		<input type="text" id="url" name="url" v-model="urlToCheck" class="form__input">
		<button @click="fetchApiData">Check</button>
	</form>
	<div class="html-validator__instructions">
		<div class="html-validator__instructions__inner">
			<h2 class="h2">About</h2>
			<br> This HTML validator uses the 
			<a href="https://validator.w3.org/docs/api.html">W3C Markup Validation Service API</a> to 
			traverse through all the urls in a domain's sitemap and outputs unique errors.
			The purpose of this validator is to reduce repetitive manual validation checks for every url 
			in a domain usually done through the <a href="https://validator.w3.org/nu/">W3C Markup Validation Site</a>,
			and output feedback from all urls in a single interface.<br><br>

			Unique errors are detected through 3 variables: the error message, code extract, and 
			its position in the template. If an error repeats in every url/template due to a 
			shared component like the header, it will be outputted once from its first instance and 
			the rest being ignored.

			<h2 class="h2">To do:</h2>
			<ul>
				<li>Owen's rec: include all urls but remove duplicate errors so first entry doesn't have to have full content</li>
			</ul>
		</div>
	</div>
	<div>
		<h2 class="h2">Results</h2>
		<div>{{ test }}</div>
	</div>
</template>
  
<script lang="ts">

	import { defineComponent } from 'vue';
	import { Result } from '../type';
import { stringifyQuery } from 'vue-router';

	export default defineComponent({
		name: 'HtmlValidationView',
		data(){
			return {
				urlToCheck: null,
				results: [],
				test: null,
				//sourceCodes: null,
				//errorLinesByUrl: null,
			}
		},
		created() {
			// this.fetchApiData();
		},
		methods: {
			async fetchApiData() { 
				try{
					console.log("testing");
					console.log(this.urlToCheck);
					this.getUrlsFromSitemapUsingProxySite();
					// const all_urls = this.getUrlsFromSitemapUsingW3C();
					// console.log(all_urls);
					// const urls = await this.filterUniqueUrls( all_urls );
					
					// let results = null;
					// let validation_results = [];

					// for( let i=0; i<urls.length; i++ ) {
					// 	const response = await fetch( `https://validator.w3.org/nu/?out=json&showsource=yes&doc=${urls[i]}`, {
					// 		method: 'GET',
					// 		headers: {
					// 			'Content-Type': 'application/json',
					// 		},
					// 	});
					// 	results = await response.json();
					// 	validation_results.push( results );
					// }

					// const unique_errors = this.filterUniqueErrors( await validation_results );
					
					// this.results = unique_errors;
					// this.formatHtml();
				} catch (error) {
					console.error('Error:', error);
				}
			}, 
			/* Use the proxy site (as a cors policy workaround) to get the sitemap source code
			*/
			async getUrlsFromSitemapUsingProxySite() {
				// const response = await fetch( `https://validator.w3.org/nu/?out=json&showsource=yes&doc=${base_url}sitemap.xml` , {
				const base_url:string|null = this.urlToCheck;
				console.log( 'https://corsproxy.io/?' + encodeURIComponent( base_url + 'sitemap.xml'));
				// const base_url:string|null = 'https://www.cbx.charcoalblue.com/';
				const response = await fetch( 'https://corsproxy.io/?' + encodeURIComponent( base_url + 'sitemap.xml' ) , {
					method: 'GET',
				});
				const xmlData = await response.text();
				
				// if (xmlData === undefined) {
				// 	throw new Error('Failed to fetch XML data');
				// }

				const parser = new DOMParser();
				const xmlDoc:Document = parser.parseFromString( xmlData, "text/xml" );
				const sitemapNodes:HTMLCollectionOf<Element> = xmlDoc.getElementsByTagName("loc");
				
	
				let urls:string[]= [];

				for( let i=0; i < sitemapNodes.length; i++ ) { 

					const textContent:string|null = sitemapNodes[i]?.textContent; //<-- optional chaining
					
					if (textContent === null || textContent === undefined) {
						throw new Error('Failed to fetch XML data');
					}

					urls.push( textContent.replace("https://www.charcoalblue-experience.test/","https://www.cbx.charcoalblue.com/") );
				}

				console.log(urls);

				return urls;
			},
			// async getSitemapDataXml( base_url: string ) {
			// 	try {
			// 		const response = await fetch( base_url + 'sitemap.xml' , {
			// 			method: 'GET',
			// 		});
			// 		if (!response.ok) {
			// 			throw new Error('Network response was not ok');
			// 		}
			// 		return response.text();
			// 	} catch (error) {
			// 		console.error('Error:', error);
			// 	}
			// },
			
			//filter out repeated sections/category urls. 
			//this means that the first section/category is best tested with all possible content
			// async filterUniqueUrls( urls: string[] ) {
			// 	let unique_urls = []; 
			// 	for ( let i=0; i<urls.length; i++ ) {
			// 		const url = new URL(urls[i]);
			// 		const paths = url.pathname.split('/').filter(slug => slug !== '');
			// 		const first_slug = paths[0];
			// 		const regex = new RegExp(`${first_slug}\/.`, 'i');
			// 		const found = unique_urls.find((element) => regex.test(element));

			// 		if( !found ) {
			// 			unique_urls.push( urls[i]);
						
			// 		}
			// 	}

			// 	return unique_urls;
			// },

			//filter out repeated errors (e.g. from shared components like header and footer)
			//check for same error, extract, and column within range of 10 
			// filterUniqueErrors ( errors: Result[] ) { 
			// 	let messages_temp = [];

			// 	for( let i = 0; i < errors.length; i++ ) {
			// 		const indexes_to_delete = [];

			// 		for( let j=0; j< errors[i].messages.length; j++ ) {
			// 			let delete_index = false;
			// 			const error_item = errors[i].messages[j];
			// 			for( let item of messages_temp ) {
			// 				let same_error= false; let same_extract = false; let same_location = false;
			// 				if ( item.message === error_item.message  ) {
			// 					same_error = true;
			// 				}
			// 				if ( item.extract === error_item.extract ) {
			// 					same_extract = true;
			// 				}
			// 				if ( error_item.firstColumn < item.location + 20 ) {
			// 					same_location = true;
			// 				}
			// 				if ( same_error && same_extract && same_location ) {
			// 					delete_index = true;
			// 					break;
			// 				}
			// 			}

			// 			if ( delete_index ) {
			// 				indexes_to_delete.push( j );
			// 				continue;
			// 			}

			// 			messages_temp.push( { message: error_item.message, extract: error_item.extract, location: error_item.lastColumn });
			// 		}

			// 		let indexes_deleted_count = 0;
			// 		indexes_to_delete.forEach( index => {
			// 			errors[i].messages.splice( index - indexes_deleted_count, 1 );
			// 			indexes_deleted_count ++;
			// 		} );
			// 	}
			// 	return errors;
			// },
			// formatHtml() {
			// 	let source_codes =[];
			// 	for( let i=0; i < this.results.length; i++){
			// 		const source_text_array = this.results[i].source.code.split('\n');
			// 		source_codes.push({ 
			// 			url: this.results[i].url, 
			// 			code: source_text_array,
			// 		});
			// 	}
			// 	this.sourceCodes = source_codes;
			// },
			// showSource( error, message, error_id, message_id ) {
			// 	const error_item = document.getElementById( error_id );
			// 	const overlay = error_item.querySelector( ".test__overlay" );
			// 	if ( message_id === null ) {
			// 		overlay.classList.remove( 'test__overlay--shown' );
			// 	} else {
			// 		overlay.classList.add( 'test__overlay--shown' );
			// 	}
			// },
			// getSourceCodeByUrl( url: string ) {
			// 	const foundCode = this.sourceCodes.find( code => code.url === url );
			// 	return foundCode ? foundCode.code : '';
			// },
			// getLineErrorsByUrl( url: string ) {
			// 	let error_lines = [];
			// 	const result = this.results.find(result => result.url === url);
				
			// 	for(let j=0; j<result.messages.length;  j++) {
			// 		error_lines.push( result.messages[j].firstLine );
			// 		error_lines.push( result.messages[j].lastLine );
			// 	}

			// 	return error_lines;
			// },
		}
	});

</script>
  