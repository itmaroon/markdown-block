import { __ } from "@wordpress/i18n";

import { registerBlockType } from "@wordpress/blocks";
import { ReactComponent as Markdown } from "./markdown.svg";

import "./style.scss";

/**
 * Internal dependencies
 */
import Edit from "./edit";
import save from "./save";
import metadata from "./block.json";

registerBlockType(metadata.name, {
	icon: <Markdown />,
	description: __(
		"This is a block that converts a text file written in markdown notation into HTML and displays it.",
		"markdown-block"
	),
	edit: Edit,
	save,
});
