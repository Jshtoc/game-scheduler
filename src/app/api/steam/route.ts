import { NextRequest, NextResponse } from "next/server";

interface SteamAppData {
  name: string;
  header_image: string;
  short_description: string;
  steam_appid: number;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "url 파라미터가 필요합니다" }, { status: 400 });
  }

  // Steam URL에서 appid 추출
  // https://store.steampowered.com/app/730/CounterStrike_2/
  const match = url.match(/store\.steampowered\.com\/app\/(\d+)/);
  if (!match) {
    return NextResponse.json(
      { error: "올바른 Steam 스토어 URL이 아닙니다" },
      { status: 400 }
    );
  }

  const appId = match[1];

  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&l=korean`,
      { next: { revalidate: 86400 } } // 24시간 캐시
    );

    const json = (await res.json()) as Record<
      string,
      { success: boolean; data: SteamAppData }
    >;

    const appData = json[appId];

    if (!appData?.success) {
      return NextResponse.json(
        { error: "게임 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const { name, header_image, short_description, steam_appid } = appData.data;

    return NextResponse.json({
      name,
      image: header_image,
      description: short_description,
      appId: steam_appid,
      storeUrl: `https://store.steampowered.com/app/${steam_appid}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Steam API 요청에 실패했습니다" },
      { status: 500 }
    );
  }
}
