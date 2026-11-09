import type { CDict } from "../en";

/** 日本語クライアント文言: content（ファーストビューの棚チェッカーと、画面遷移中のスケルトン）。 */
export const content: CDict["content"] = {
  quickCheck: {
    model: "iPhoneのモデルを選ぶ",
    search: "ZIPコード・都市・店舗名で探す",
    useLocation: "自分の位置から近い順に並べる",
    nearMe: "📍 位置を確かめる",
    locationOff: "このサイトでは位置情報が使えない設定です。代わりにZIPコードを入れてください。",
    storesNow: "{what}：いま米国のApple Store **{n}/{total}店舗** の棚にあり",
    nearestTo: " · {place}を起点に並べ替え",
    you: "あなたの位置",
    noMatch: "見つかりませんでした。5桁のZIPコードか都市名を入れてください。",
    inStock: "棚にあり {n}/{total}",
    soldOut: "棚になし",
    alertMe: "見守りリストに加える",
    allStores: "店舗の一覧（{n}店舗） →",
    here: "すぐそこ",
  },
  skeleton: {
    loading: "読み取り中",
  },
};
