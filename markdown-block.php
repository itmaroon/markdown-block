<?php
/**
 * Plugin Name:       Mark Down Block
 * Plugin URI:        https://itmaroon.net
 * Description:       マークダウン記法で書かれたテキストファイルをHTML化して表示するブロックです
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            WebクリエイターITmaroon
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       markdown-block
 *
 * @package           itmar
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
if ( ! defined( 'ABSPATH' ) ) exit;

function itmar_markdown_block_block_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'itmar_markdown_block_block_init' );

function itmar_markdown_block_add_plugin() {
	//管理画面以外（フロントエンド側でのみ読み込む）
	if (!is_admin()) {
		wp_enqueue_script( 
			'markdown_plugin_handle', 
			plugins_url( '/assets/front_rendering.js?'.date('YmdHis'), __FILE__ ), 
			array('jquery'), 
			'1.0.0',
			true
		);
	}

	//nonceの生成
	wp_localize_script( 'itmar-gutenberg-extensions-script', 'itmar_markdown_option', array(
		'nonce' => wp_create_nonce('wp_rest'),
	));
}

add_action('enqueue_block_assets', 'itmar_markdown_block_add_plugin');
