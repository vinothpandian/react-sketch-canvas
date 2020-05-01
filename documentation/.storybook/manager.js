import { addons } from "@storybook/addons";
import theme from "./theme";

addons.setConfig({
  /**
   * show story component as full screen
   * @type {Boolean}
   */
  isFullscreen: false,

  /**
   * display panel that shows addon configurations
   * @type {Boolean}
   */
  showPanel: true,

  /**
   * where to show the addon panel
   * @type {('bottom'|'right')}
   */
  panelPosition: "right",

  theme: theme,
});
