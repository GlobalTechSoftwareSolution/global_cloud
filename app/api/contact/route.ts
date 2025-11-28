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
  try {
    const body = await request.json();
    const { name, phone, email, service, message } = body;

    // Validate required fields
    if (!name || !phone || !email || !service || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a temporary Python script
    const scriptContent = `
import sys
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(name, phone, email, service, message):
    sender_email = "hrglobaltechsoftwaresolutions@gmail.com"
    app_password = "zmwp hxux yzbp qftd"   # Your 16-digit Gmail App Password

    #-------------------------------
    # 1️⃣ Email TO COMPANY (You)
    #-------------------------------
    company_receiver = sender_email

    company_subject = "New Contact Form Submission"

    company_body = f"""
    New Inquiry from Website Contact Form

    Name: {name}
    Phone: {phone}
    Email: {email}
    Service Interested: {service}

    Message:
    {message}
    """

    company_msg = MIMEMultipart()
    company_msg["From"] = sender_email
    company_msg["To"] = company_receiver
    company_msg["Subject"] = company_subject
    company_msg.attach(MIMEText(company_body, "plain"))

    #-------------------------------
    # 2️⃣ Email TO CUSTOMER (Auto Reply)
    #-------------------------------
    customer_receiver = email

    customer_subject = "We Received Your Request – Global Tech Software Solutions"

    customer_body = f"""
    Hi {name},

    Thank you for contacting Global Tech Software Solutions.

    We have received your request regarding: {service}.
    Our team will contact you soon.

    Regards,
    Global Tech Software Solutions
    """

    customer_msg = MIMEMultipart()
    customer_msg["From"] = sender_email
    customer_msg["To"] = customer_receiver
    customer_msg["Subject"] = customer_subject
    customer_msg.attach(MIMEText(customer_body, "plain"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, app_password)

        # Send to company
        server.sendmail(sender_email, company_receiver, company_msg.as_string())

        # Send auto-reply to customer
        server.sendmail(sender_email, customer_receiver, customer_msg.as_string())

        server.quit()

        print("success")

    except Exception as e:
        print("error:" + str(e))
        raise e


# Get arguments from command line
if __name__ == "__main__":
    if len(sys.argv) != 6:
        print("error:Invalid number of arguments")
        sys.exit(1)
    
    name = sys.argv[1]
    phone = sys.argv[2]
    email = sys.argv[3]
    service = sys.argv[4]
    message = sys.argv[5]
    
    send_email(name, phone, email, service, message)
`;

    // Write the Python script to a temporary file
    const tempDir = process.env.TEMP || '/tmp';
    const scriptPath = join(tempDir, 'send_email.py');
    await writeFile(scriptPath, scriptContent);

    // Run the Python script
    const result = await runPythonScript(scriptPath, [name, phone, email, service, message]);

    // Clean up the temporary file
    await unlink(scriptPath);

    // Check the result
    if (result.stdout.includes('success')) {
      return new Response(
        JSON.stringify({ message: 'Email sent successfully!' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else if (result.stderr) {
      console.error('Python script error:', result.stderr);
      return new Response(
        JSON.stringify({ error: 'Failed to send email: ' + result.stderr }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Unknown error occurred' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}