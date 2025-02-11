# MarkDown Block

マークダウン文書をブロックに対応させWebページにスタイリングするためのブロックです。

## 概要
このリポジトリはMarkDown BlockというWordpressのプラグインのソースコードを含んでいます。
zipファイルをダウンロードしてWordpress管理画面からプラグインのインストールを行うとプラグインとして機能します。
このブロックはマークダウン文書をSimpleMDEによって編集する機能をもち、markedによりマークダウン文書をパースすることで変換されたHTML要素に特定のブロックを対応させるという機能を持っています。
この機能によりユーザーは対応したブロックのスタイリング機能などを使ってカスタマイズを行うことができ、マークダウン文書を多彩にスタイリングすることができます。
以下にマークダウン文書がHTML要素にパースされたときに適用されるブロックを示します。
1. H要素・・・itmar/design-title
2. P要素・・・core/paragraph
3. PRE要素・・・itmar/code-highlight
4. IMG要素・・・core/image
5. BLOCKQUOTE要素・・・core/quote
6. LI要素・・・core/list
7. TABLE要素・・・core/table
また、H要素は目次として生成され、レベルによってネストして表示するという機能を持ちます。

## その他特筆事項
1. 今回のバージョンでは、レスポンシブ対応が必要と思われるスタイル設定について、デスクトップモード（幅768px以上のデバイスでの表示）とモバイルモード（幅767px以下のデバイスでの表示）で、別々の設定が可能となっています。どちらの設定なのかは、ブロックエディタやサイトエディタで表示モードを切り替えたとき、サイドメニューの表示に「（デスクトップ）」、「（モバイル）」と表示されるようになっています。
なお、タブレット表示に関するレスポンシブには対応しておりません。
2. このプラグインは、Block collectionsに依存しています。このプラグインを使用するためには、Block collectionsのインストールと有効化が必要です。
3. 文言等の表示に関しては、WordPressの国際化関数による設定を行っていますので、多国籍の言語表示が可能です。現時点においては英語と日本語表記が可能となっています。

## 留意事項
1. このプラグインはマークダウン文書の編集機能を実装するため、SimpleMDE（Simple Markdown Editor）を利用しています。これはMITライセンスの下で提供されているオープンソースのJavaScriptライブラリです。
	[SimpleMDE LICENSE](https://github.com/sparksuite/simplemde-markdown-editor/blob/master/LICENSE)
2. このプラグインはマークダウン文書をパースし、HTML要素に変換するためmarkedを利用しています。これはMITライセンスの下で提供されているオープンソースのJavaScriptライブラリです。
	[marked LICENSE](https://github.com/markedjs/marked/blob/master/LICENSE.md)

