<template>
   <div class="html-validator__form">
		<label class="bold" for="url">Homepage URL</label><br>
		<input type="text" id="url" name="url" class="html-validator__form__input">
	</div>

   <nav class="nav">
    <router-link to="/">About</router-link> |
    <router-link to="/html-validation">Html Validator</router-link> | 
    <router-link to="/accessibility">Accessibility Check</router-link>
  </nav>
  <router-view/>
</template>

<script lang="ts">

	import { defineComponent } from 'vue';

	export default defineComponent({
		name: 'WebpageView',
		data():
		{ 
			urlToCheck: string | null,
		}
		{
			return {
				urlToCheck: null,
			}
		},
		methods: {
			
		}
	});

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
nav {
  padding: 30px;
}
nav a {
  font-weight: bold;
  color: #2c3e50;
}
nav a.router-link-exact-active {
  color: #42b983;
}
</style>

