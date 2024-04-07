<?php

/**
 * Plugin Name:       Mark Down Block
 * Plugin URI:        https://itmaroon.net
 * Description:       This is a block that converts a text file written in markdown notation into HTML and displays it.
 * Requires at least: 6.3
 * Requires PHP:      8.0.22
 * Version:           0.1.0
 * Author:            Web Creator ITmaroon
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
if (!defined('ABSPATH')) exit;

// 1. ブロックの登録
function itmar_markdown_block_block_init()
{
	$script_handle = 'itmar-handle-markdown-block';
	$script_file = plugin_dir_path(__FILE__) . 'build/index.js';
	wp_register_script(
		$script_handle,
		plugins_url('build/index.js', __FILE__),
		array('wp-blocks', 'wp-element', 'wp-i18n', 'wp-block-editor'),
		filemtime($script_file)
	);
	register_block_type(
		__DIR__ . '/build',
		array(
			'editor_script' => $script_handle
		)
	);
	// その後、このハンドルを使用してスクリプトの翻訳をセット
	wp_set_script_translations($script_handle, 'markdown-block', plugin_dir_path(__FILE__) . 'languages');

	// register_block_type(
	// 	__DIR__ . '/build',
	// );
	// // register_block_typeで生成されるハンドルを使用してスクリプトの翻訳をセット
	// wp_set_script_translations('itmar-markdown-block-editor-script', 'markdown-block', plugin_dir_path(__FILE__) . 'languages');

	//PHP用のテキストドメインの読込（国際化）
	load_plugin_textdomain('markdown-block', false, basename(dirname(__FILE__)) . '/languages');
}
add_action('init', 'itmar_markdown_block_block_init');

function itmar_markdown_block_add_plugin()
{
	//管理画面以外（フロントエンド側でのみ読み込む）
	if (!is_admin()) {
		wp_enqueue_script(
			'markdown_plugin_handle',
			plugins_url('/assets/front_rendering.js?' . date('YmdHis'), __FILE__),
			array('jquery'),
			'1.0.0',
			true
		);
	}

	//nonceの生成
	wp_localize_script('itmar-gutenberg-extensions-script', 'itmar_markdown_option', array(
		'nonce' => wp_create_nonce('wp_rest'),
	));
}

add_action('enqueue_block_assets', 'itmar_markdown_block_add_plugin');
