// <rkui-range> for plain HTML pages, bundled into dist/rkui.js. Only a range with a readout needs
// it: <rkui-range label="Opacity" readout min="0" max="1" step="0.01" value="0.28"></rkui-range>.
// It doesn't take `ticks`, which an attribute can't carry as a list; a page that wants ticks, or
// no readout, writes the slider's HTML.
import { defineElement } from '../../shared/define-element'
import Range from './Range.vue'

defineElement('rkui-range', Range)
