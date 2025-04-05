import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 환경 변수 확인
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OpenAI API key is missing or empty');
}

const openai = new OpenAI({
  apiKey: apiKey || '',
});

export async function GET(request: NextRequest) {
  try {
    // API 키 확인
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 },
      );
    }

    // 현재 날짜 기준으로 이번 달의 사용량 조회
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // OpenAI API를 직접 호출하여 사용량 조회
    const response = await fetch('https://api.openai.com/v1/usage', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '사용량 조회 실패');
    }

    const usageData = await response.json();
    return NextResponse.json(usageData);
  } catch (error) {
    console.error('OpenAI usage error:', error);
    return NextResponse.json(
      { error: 'OpenAI 사용량 조회 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
