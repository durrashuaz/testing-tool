<template>
	<div class="html-validator__form">
		<label class="bold" for="url">Base URL</label><br>
		<input type="text" id="url" name="url" v-model="urlToCheck" class="html-validator__form__input">
		<button class="button" @click="fetchApiData">Check</button>
	</div>
	<div class="html-validator__instructions">
		<div class="html-validator__instructions__inner">
			<div class="flex flex--align-center flex--justify-center mb-8">
				<h2 class="h2 h2--about inline bold">About</h2>
				<span class="dropdown-arrow inline" @click="handleAboutDropdownClick"></span>
			</div>
			<div class="html-validator__instructions__inner__content">
				<br> This HTML validator uses the 
				<a href="https://validator.w3.org/docs/api.html">W3C Markup Validation Service API</a> to 
				traverse through all the urls in a domain's sitemap and outputs unique errors.
				The purpose of this validator is to reduce repetitive manual validation checks for every url 
				in a domain usually done through the <a href="https://validator.w3.org/nu/">W3C Markup Validation Site</a>,
				and output feedback from all urls in a single page.<br><br>

				Unique errors are detected through 3 variables: the error message, code extract, and 
				its position in the template. Only urls that have unique errors are displayed 
				(e.g. if they have not already appeared in another url)
			</div>
		</div>
	</div>
	<div>
		<h2 class="h2 inline bold">Results</h2> <span class="inline" v-if="results!= null">{{ '(' + results?.length + ' urls)' }}</span>
		<!-- <div class="loader"></div> -->
		<p>{{ requestStatus }}</p>
		<p v-if="requestTimeRemaining != null">{{ requestTimeRemaining }} seconds remaining...</p>
		<div class="grid flex flex--wrap mt-16">
			<div v-for="(result, index) in results" :id="'result-' + index" class="grid__item mb-80 result">

				<div class="test__url">{{ index + 1}} ) {{result.url}}<span class="test__border test__border--black test__border--s">{{ result.messages.length }} errors</span></div>

				<div v-for="(message, index_message) in result.messages" :id="'message-'+index_message" class="test__result flex">
					
					<ul class="grid__item test__result__message">
						<li class="inline test__border test__border--s" :class="{ ' test__border--error': message.type === 'error' }">{{ message.type }}</li>
						<li class="test__result__error">{{ message.message }}</li>
						<li><a @click="showSource( result, message, 'result-'+index, 'message-'+index_message )" class="test__overlay-button" :href="'#url-' + index + 'line-' + (message.firstLine == null ? message.lastLine : message.firstLine)">From line {{ message.firstLine == null ? message.lastLine : message.firstLine }}, column {{ message.firstColumn }}; to line {{ message.lastLine }}, column {{ message.lastColumn }}</a></li>
						<li class="test__result__extract">{{ message.extract }}</li>
					</ul>
				</div>
				
				<div class="test__overlay">
					<div class="flex flex--justify-end">
						<button class="test__overlay__button" @click="showSource( null, null, 'result-'+index, null)">Close</button>
					</div>
					<div class="test__url">{{result.url}}</div>
					<pre>
						<ol>
							<li v-for="(line, index_message) in getSourceCodeByUrl( result.url )" :id="'url-'+ index +'line-'+(index_message+1)" :key="index_message" :class="{ 'test__highlighted': getLineErrorsByUrl( result.url ).includes(index_message+1) }"><span>{{ (index_message+1) }}</span>{{ line == '' ? '&nbsp;' : line }}</li>
						</ol>
					</pre>
				</div>
			</div>
		</div>
	</div>

</template>
  
<script lang="ts">

	import { defineComponent } from 'vue';
	import { Result, Message } from '../type';

	export default defineComponent({
		name: 'HtmlValidationView',
		data():
		{ 
			results: Result[] | null,
			urlToCheck: string | null,
			sourceCodes: { url: string; code: string[]; }[] | null,
			resultsLoaded: boolean,
			aboutDropdown: boolean,
			requestStatus: string | null,
			requestTimeRemaining: number | null,
			requestTotalTime: number|null,
		}
		{
			return {
				urlToCheck: null,
				results: null,
				sourceCodes: null,
				resultsLoaded: false,
				aboutDropdown: false,
				requestStatus: null,
				requestTimeRemaining: null,
				requestTotalTime: null,
			}
		},
		methods: {
			async fetchApiData() { 
				try {
					const urls_from_sitemap = this.getUrlsFromSitemapUsingProxySite();
					const urls = await this.filterUniqueUrls( await urls_from_sitemap );

					let results = null;
					let validation_results = [];
					let failed_requests:string[]|null = [];

					for( let i=0; i<urls.length; i++ ) {
						this.requestStatus = "fetching errors for " + urls[i] + "...";
						const response = await fetch( `https://validator.w3.org/nu/?out=json&showsource=yes&doc=${urls[i]}`, {
							method: 'GET',
							headers: {
								'Content-Type': 'application/json',
							},
						});
						if ( !response.ok ) {
							this.requestStatus = `HTTP error! Status: ${response.status}`;
							failed_requests.push( urls[i] );
							throw new Error( `HTTP error! Status: ${response.status}` );
						}
						if ( i == urls.length - 1 ) {
							if ( failed_requests.length === 0 ) {
								this.requestStatus = null;
							}
							else {
								this.requestStatus = "Failed requests for " + failed_requests.join( ', ' );
							}
						}
						results = await response.json();
						validation_results.push( results );
					}

					const unique_errors = this.filterUniqueErrors( await validation_results );

					this.results = JSON.parse(JSON.stringify(unique_errors));
					this.formatHtml();
			
				} catch (error) {	
					console.error('Error:', error);
				}
			},
			async getUrlsFromSitemapUsingProxySite() {
			/* Use the proxy site (as a cors policy workaround) to get the sitemap source code */

				const base_url:string|null = this.urlToCheck;
			
				this.requestStatus = "Getting urls from sitemap...";
				const response = await fetch( 'https://corsproxy.io/?' + encodeURIComponent( base_url + '/sitemap.xml' ) , {
					method: 'GET',
				});
				const xml_data = await response.text();

				const parser = new DOMParser();
				const xml_doc:Document = parser.parseFromString( xml_data, "text/xml" );
				const sitemap_nodes:HTMLCollectionOf<Element> = xml_doc.getElementsByTagName("loc");
				let urls:string[]= [];

				for( let i=0; i < sitemap_nodes.length; i++ ) { 
					const textContent:string|null = sitemap_nodes[i]?.textContent; //<-- optional chaining
					if (!(textContent === null || textContent === undefined || textContent === "")) {
						urls.push( textContent );
					}
				}

				return urls;
			},
			async filterUniqueUrls( urls_from_sitemap: string[] ) {
			/* Use first slug to check for unique urls 
				limitation: weak determination of a unique url
				solution: unqiue urls stop at second last slug of repeated pattern urls - get only first instance
			*/
				const urls = await urls_from_sitemap;
				let unique_urls:string[] = []; 
				
				for ( let i=0; i<urls.length; i++ ) {
					const url = new URL(urls[i]);
					const paths = url.pathname.split('/').filter(slug => slug !== '');
					const first_slug = paths[0];
					const regex = new RegExp(`${first_slug}\/.`, 'i');
					const found = unique_urls.find((element) => regex.test(element));

					if( !found ) {
						unique_urls.push( urls[i]);
					}
				}

				return unique_urls;
			},
			filterUniqueErrors ( errors: Result[] ) { 
			/* Filter out repeated errors (e.g. from shared components like header and footer)
			check for same error, extract, and column within a range */

				let messages_temp = [];

				for( let i = 0; i < errors.length; i++ ) {
					const indexes_to_delete = [];

					for( let j=0; j< errors[i].messages.length; j++ ) {
						let delete_index = false;
						const error_item = errors[i].messages[j];
						for( let item of messages_temp ) {
							let same_error= false; let same_extract = false; let same_location = false;
							if ( item.message === error_item.message ) {
								same_error = true;
							}
							if ( item.extract === error_item.extract ) {
								same_extract = true;
							}
							if ( error_item.firstColumn < item.location + 20 ) {
								same_location = true;
							}
							if ( same_error && same_extract && same_location ) {
								delete_index = true;
								break;
							}
						}

						if ( delete_index ) {
							indexes_to_delete.push( j );
							continue;
						}

						messages_temp.push( { message: error_item.message, extract: error_item.extract, location: error_item.lastColumn });
					}

					let indexes_deleted_count = 0;
					indexes_to_delete.forEach( index => {
						errors[i].messages.splice( index - indexes_deleted_count, 1 );
						indexes_deleted_count ++;
					} );
				}
				return errors;
			},
			formatHtml() {
				let source_codes =[];
				if( this.results !== null) {
				for( let i=0; i < this.results.length; i++){
					const source_text_array = this.results[i].source.code.split('\n');
					source_codes.push({ 
						url: this.results[i].url, 
						code: source_text_array,
					});
				}
				this.sourceCodes = source_codes;
				}
			},
			showSource( error:Result|null, message:Message|null, error_id:string, message_id:string|null ) {
				const error_item:HTMLElement|null= document.getElementById( error_id );
				if(error_item === null ){
					throw new Error('HTML Element is null');
				}
				const overlay = error_item.querySelector( ".test__overlay" );
				if( overlay === null ){
					throw new Error('Overlay element is null');
				}

				if ( message_id === null ) {
					overlay.classList.remove( 'test__overlay--shown' );
				} else {
					overlay.classList.add( 'test__overlay--shown' );
				}
			},
			getSourceCodeByUrl( url:string ) {
				if( this.sourceCodes === null ){
					throw new Error('Source codes is null');
				}
				const foundCode = this.sourceCodes.find( code => code.url === url );
				return foundCode ? foundCode.code : '';
			},
			getLineErrorsByUrl( url:string ) {
				if( this.results === null ){
					throw new Error('Source codes is null');
				}

				let error_lines = [];
				const result = this.results.find(result => result.url === url);
				
				if( result === null || result === undefined){
					throw new Error('Source codes is null');
				}

				for(let j=0; j<result.messages.length;  j++) {
					error_lines.push( result.messages[j].firstLine );
					error_lines.push( result.messages[j].lastLine );
				}

				return error_lines;
			},
			handleAboutDropdownClick() {
				const dropdown_button = document.querySelector<HTMLElement>(".dropdown-arrow");
				const about_content = document.querySelector<HTMLElement>(".html-validator__instructions__inner__content");
				if( dropdown_button && about_content) {
					if( this.aboutDropdown ) {
						dropdown_button.classList.remove("dropdown-arrow--open");
						about_content.classList.remove("html-validator__instructions__inner__content--visible");
						this.aboutDropdown = false;
					}
					else if( ! ( this.aboutDropdown && about_content ) ) {
						dropdown_button.classList.add("dropdown-arrow--open");
						about_content.classList.add("html-validator__instructions__inner__content--visible");
						this.aboutDropdown = true;
					}
				}
			}
		}
	});

</script>
  