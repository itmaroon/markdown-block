=== MarkDown Block ===
Contributors:      itmaroon
Tags:              block, markdown, post, blog
Requires at least: 6.3
Tested up to:      6.7.2
Stable tag:        0.1.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html
Requires PHP: 8.2.10

This block converts Markdown documents into blocks for styling web pages.

== Description ==

This block has the function of editing Markdown documents using SimpleMDE, and by parsing Markdown documents using marked, it can assign specific blocks to the converted HTML elements.
This function allows users to customize Markdown documents using the styling functions of the corresponding blocks, allowing for a wide range of styling.
The following are the blocks that are applied when Markdown documents are parsed into HTML elements.

1. H element: itmar/design-title
2. P element: core/paragraph
3. PRE element: itmar/code-highlight
4. IMG element: core/image
5. BLOCKQUOTE element: core/quote
6. LI element: core/list
7. TABLE element: core/table

The H element is also generated as a table of contents, and has the function of displaying nested items according to level.

== Related Links ==

* [markdown-block:Github](https://github.com/itmaroon/markdown-block)
* [block-class-package:GitHub](https://github.com/itmaroon/block-class-package)  
* [block-class-package:Packagist](https://packagist.org/packages/itmar/block-class-package) 
* [itmar-block-packages:npm](https://www.npmjs.com/package/itmar-block-packages)  
* [itmar-block-packages:GitHub](https://github.com/itmaroon/itmar-block-packages)

== Installation ==

1. From the WP admin panel, click “Plugins” -> “Add new”.
2. In the browser input box, type “Markdown Block”.
3. Select the “Markdown Block” plugin and click “Install”.
4. Activate the plugin.

OR…

1. Download the plugin from this page.
2. Save the .zip file to a location on your computer.
3. Open the WP admin panel, and click “Plugins” -> “Add new”.
4. Click “upload”.. then browse to the .zip file downloaded from this page.
5. Click “Install”.. and then “Activate plugin”.

== Frequently Asked Questions ==



== Screenshots ==
1. On the left is the Markdown document editing area, and on the right is the preview after styling and the block editing area.
2. HTML element style management and table of contents settings screen
3. Front-end display including table of contents
4. Front-end display with top table of contents open
5. Responsive design
6. Responsive design with table of contents open

== Changelog ==

= 0.1.0 =
* Release

== Arbitrary section ==
1. PHP class management is now done using Composer.  
[GitHub](https://github.com/itmaroon/block-class-package)  
[Packagist](https://packagist.org/packages/itmar/block-class-package)
 
2. I decided to make functions and components common to other plugins into npm packages, and install and use them from npm.  
[npm](https://www.npmjs.com/package/itmar-block-packages)  
[GitHub](https://github.com/itmaroon/itmar-block-packages)

== External services ==  
1. This plugin uses EasyMDE to implement the editing function of Markdown documents. This is an open source JavaScript library provided under the MIT license.
[EasyMDE LICENSE](https://github.com/Ionaru/easy-markdown-editor/blob/master/LICENSE)
This plugin has a spell check function as standard, but we do not use it because it references an external dictionary file.
2. This plugin uses marked to parse Markdown documents and convert them to HTML elements. This is an open source JavaScript library provided under the MIT license.
[marked LICENSE](https://github.com/markedjs/marked/blob/master/LICENSE.md)