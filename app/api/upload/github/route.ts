import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { fileName, content, path } = await req.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid file content payload' }, { status: 400 });
    }

    // 1. Validasi Ukuran Berkas (Maksimal 5MB)
    // 5MB = 5 * 1024 * 1024 bytes = 5,242,880 bytes
    // Ukuran asli dalam byte = (panjang base64 * 3) / 4
    const approxSizeBytes = (content.length * 3) / 4;
    if (approxSizeBytes > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran berkas melebihi batas maksimal 5MB' }, { status: 400 });
    }

    // 2. Validasi Tipe Berkas (Hanya Gambar lewat Magic Number Base64)
    const allowedSignatures = [
      '/9j/',       // JPEG
      'iVBORw0KGgo', // PNG
      'UklGR',       // WebP
      'R0lGOD',      // GIF
      'PHN2Zy',      // SVG (<svg)
      'PD94bW',      // SVG (<?xml)
    ];
    
    const isAllowedImage = allowedSignatures.some(sig => content.startsWith(sig));
    if (!isAllowedImage) {
      return NextResponse.json({ error: 'Format berkas tidak diizinkan. Hanya menerima gambar (WebP, PNG, JPEG, SVG, GIF)' }, { status: 400 });
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO = process.env.GITHUB_REPO; // e.g. "nandaaddi/kanba-assets"
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      console.error('GitHub Config Missing:', { token: !!GITHUB_TOKEN, repo: !!GITHUB_REPO });
      return NextResponse.json({ error: 'GitHub configuration missing' }, { status: 500 });
    }

    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}/${fileName}`;
    console.log('GitHub Upload Request:', { url, branch: GITHUB_BRANCH });

    // Check if file exists to get SHA (for updating)
    let sha;
    const checkRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'Finance-Manager-App'
      },
    });

    if (checkRes.ok) {
      const data = await checkRes.json();
      sha = data.sha;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Finance-Manager-App'
      },
      body: JSON.stringify({
        message: `Upload ${fileName} via Finance Manager`,
        content: content, // base64
        branch: GITHUB_BRANCH,
        sha: sha,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API Error Details:', errorData);
      return NextResponse.json({ 
        error: errorData.message || 'GitHub upload failed',
        details: errorData 
      }, { status: response.status });
    }

    const cdnUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@${GITHUB_BRANCH}/${path}/${fileName}`;

    return NextResponse.json({ url: cdnUrl });
  } catch (error: any) {
    console.error('Internal Server Error (GitHub Upload):', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
