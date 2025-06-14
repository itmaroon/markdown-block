<?php

/**
 * Plugin Name:       MarkDown Block
 * Plugin URI:        https://itmaroon.net
 * Description:       This is a block that converts a text file written in markdown notation into HTML and displays it.
 * Requires at least: 6.4
 * Requires PHP:      8.2
 * Version:           1.1.0
 * Author:            Web Creator ITmaroon
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       markdown-block
 * Domain Path:       /languages 
 *
 * @package           itmar
 */


//PHPファイルに対する直接アクセスを禁止
if (!defined('ABSPATH')) exit;

// プラグイン情報取得に必要なファイルを読み込む
if (!function_exists('get_plugin_data')) {
	require_once(ABSPATH . 'wp-admin/includes/plugin.php');
}



require_once __DIR__ . '/vendor/itmar/loader-package/src/register_autoloader.php';
$block_entry = new \Itmar\BlockClassPackage\ItmarEntryClass();

//ブロックの初期登録
add_action('init', function () use ($block_entry) {
	$plugin_data = get_plugin_data(__FILE__);
	$block_entry->block_init($plugin_data['TextDomain'], __FILE__);
	//nonceのローカライズ
	wp_localize_script('itmar-script-handle', 'itmar_markdown_option', array(
		'nonce' => wp_create_nonce('wp_rest'),
	));
});


// 依存するプラグインが有効化されているかのアクティベーションフック
register_activation_hook(__FILE__, function () use ($block_entry) {
	$plugin_data = get_plugin_data(__FILE__);
	$block_entry->activation_check($plugin_data, ['block-collections']); // ここでメソッドを呼び出し
});

// 管理画面での通知フック
add_action('admin_notices', function () use ($block_entry) {
	$plugin_data = get_plugin_data(__FILE__);
	$block_entry->show_admin_dependency_notices($plugin_data, ['block-collections']);
});

function itmar_block_class_package_add_frontjs()
{

	//管理画面以外（フロントエンド側でのみ読み込む）
	if (!is_admin()) {
		$script_path = plugin_dir_path(__FILE__) . 'assets/front_rendering.js';
		wp_enqueue_script(
			'markdown_plugin_handle',
			plugins_url('/assets/front_rendering.js?', __FILE__),
			array('jquery'),
			filemtime($script_path),
			true
		);
	}
}

add_action('enqueue_block_assets', 'itmar_block_class_package_add_frontjs');
