<template>
   <nav class="nav">
    <router-link to="/html-validation">W3C Html Validator</router-link>
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

