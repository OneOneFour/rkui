// <rkui-color-picker> for plain HTML pages, bundled into dist/rkui.js, for a picker with a custom
// colour tile: <rkui-color-picker custom legend="Accent" value="teal"></rkui-color-picker>. It draws
// every hue. A picker without `custom` needs no element: the page writes its HTML.
import { defineElement } from '../../shared/define-element'
import ColorPicker from './ColorPicker.vue'

defineElement('rkui-color-picker', ColorPicker)
