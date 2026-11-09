// <rkui-dial> for plain HTML pages, bundled into dist/rkui.js: <rkui-dial label="Temperature"
// min="10" max="30" step="0.5" value="20"></rkui-dial>.
import { defineElement } from '../../shared/define-element'
import Dial from './Dial.vue'

defineElement('rkui-dial', Dial)
