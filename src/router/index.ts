import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HtmlValidationView from '../views/HtmlValidationView.vue'
import AccessibilityView from '../views/AccessibilityView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/html-validation',
    name: 'htmlValidation',
    component: HtmlValidationView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
