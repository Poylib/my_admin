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

// OpenAI API 사용량 확인 함수
async function checkOpenAILimit() {
  try {
    // 현재 날짜 기준으로 이번 달의 사용량 조회
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // YYYY-MM-DD 형식으로 날짜 포맷팅
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const today = formatDate(now);

    // OpenAI API를 직접 호출하여 사용량 조회
    const response = await fetch(
      `https://api.openai.com/v1/usage?date=${today}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '사용량 조회 실패');
    }

    const usageData = await response.json();

    // 여기서는 간단하게 토큰 사용량이 1000 이상이면 한도에 도달했다고 가정
    // 실제로는 더 복잡한 로직이 필요할 수 있음
    if (usageData && usageData.total_tokens && usageData.total_tokens > 1000) {
      return {
        canTranslate: false,
        message:
          'OpenAI API 사용 한도에 도달했습니다. 나중에 다시 시도해주세요.',
        usage: usageData,
      };
    }

    return {
      canTranslate: true,
      message: '번역 가능합니다.',
      usage: usageData,
    };
  } catch (error) {
    console.error('OpenAI usage error:', error);
    return {
      canTranslate: false,
      message: 'OpenAI 사용량 조회 중 오류가 발생했습니다.',
      error: error,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // API 키 확인
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 },
      );
    }

    // 한도 확인
    const limitCheck = await checkOpenAILimit();
    if (!limitCheck.canTranslate) {
      return NextResponse.json(
        { error: limitCheck.message, usage: limitCheck.usage },
        { status: 429 }, // Too Many Requests
      );
    }

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용이 필요합니다.' },
        { status: 400 },
      );
    }

    const prompt = `
Please translate the following Korean blog post to English.
Keep the markdown formatting intact.
Maintain the same tone and style of writing.

Title: ${title}

Content:
${content}

Translate to English maintaining all markdown formatting.
Return in JSON format with "title" and "content" fields.
`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content ?? '{}');

    return NextResponse.json({
      title: result.title,
      content: result.content,
      usage: limitCheck.usage, // 사용량 정보도 함께 반환
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: '번역 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
