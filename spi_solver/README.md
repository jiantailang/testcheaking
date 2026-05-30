# SPI / TG-WEB / 玉手箱 自動回答システム

## セットアップ

```bash
# 1. 依存パッケージのインストール
pip install -r requirements.txt

# 2. Playwright ブラウザのインストール
playwright install chromium
```

## 起動方法

```bash
cd spi_solver
python main.py <テストのURL>
```

例:
```bash
python main.py https://example.com/spi/start
```

## ディレクトリ構成

```
spi_solver/
├── main.py               # エントリーポイント・制御フロー
├── browser_ctrl.py       # Playwright操作
├── question_parser.py    # 問題文・選択肢・タイプ抽出
├── config.py             # 設定値
├── solvers/
│   ├── math_solver.py    # 数値計算系ソルバー
│   ├── lang_matcher.py   # 言語系ソルバー
│   └── answer_click.py   # 選択肢クリック・入力処理
├── utils/
│   └── wait_helper.py    # 待機・リトライユーティリティ
├── requirements.txt
└── README.md
```

## 対応問題タイプ

| タイプ | 説明 | 解法 |
|---|---|---|
| `CALC` | 四則演算・割合・速度・損益 | Pythonロジックで数値算出 |
| `PROBABILITY` | 確率・場合の数・集合 | `math.comb` / `math.perm` |
| `SYNONYM` | 語句の意味・同義語 | `difflib` 文字列類似度 |
| `FILL` | 空欄補充 | n-gram スコアリング |
| `SEQUENCE` | 語句並べ替え | n-gram 文法スコア |
| `READING` | 文章読解 | 本文との類似度スコア |

## 設定変更 (`config.py`)

| 設定値 | デフォルト | 説明 |
|---|---|---|
| `TEST_TYPE` | `"SPI"` | テスト種別 |
| `HEADLESS` | `False` | ブラウザ表示 (`True` で非表示) |
| `WAIT_MIN` / `WAIT_MAX` | `1.0` / `3.0` | 人間らしい待機時間 (秒) |
| `MAX_RETRIES` | `3` | リトライ回数 |

## エラー時の動作

- 問題解析エラー・クリック失敗時は `screenshots/` にスクリーンショットを保存してスキップ
- 問題タイプ不明 (`UNKNOWN`) の場合は最初の選択肢を選択

## ログ出力例

```
[Q1] type=CALC         answer='B: 12.5'      choices=['A: 10', 'B: 12.5', 'C: 15']
[Q2] type=PROBABILITY  answer='C: 10通り'    choices=['A: 6通り', 'B: 8通り', 'C: 10通り']
[Q3] type=SYNONYM      answer='A: 迅速'       choices=['A: 迅速', 'B: 緩慢', 'C: 敏感']
```

## doctestの実行

```bash
python solvers/math_solver.py
```
