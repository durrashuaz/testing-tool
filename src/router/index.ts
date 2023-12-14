import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HtmlValidationView from '../views/HtmlValidationView.vue'
import AccessibilityView from '../views/AccessibilityView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/accessibility',
    name: 'accessibility',
    component: AccessibilityView
  },
  {
    path: '/html-validation',
    name: 'htmlValidation',
    component: HtmlValidationView
  },
  {
    path: '/',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
