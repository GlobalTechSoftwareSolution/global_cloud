import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

// Helper function to run Python script
async function runPythonScript(scriptPath: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [scriptPath, ...args]);
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Python script exited with code ${code}: ${stderr}`));
      }
    });
  });
}

export async function POST(request: NextRequest) {
  // Forward the request to the external API
  const body = await request.json();
  
  try {
    const response = await fetch('http://hrms.globaltechsoftwaresolutions.cloud/api/accounts/contact/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();
    
    return new Response(
      JSON.stringify(responseData),
      { 
        status: response.status, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to connect to external API' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}