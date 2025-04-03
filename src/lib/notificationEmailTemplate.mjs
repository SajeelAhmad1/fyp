import { sendMail } from "./transporterEmail.mjs";

class NotificationSend {
  /**
   * Send notification email to user
   * @param {string} id - Tenant domain
   * @param {string} email - Tenant name
   * @param {string} signInUrl - Tenant name
   */
  static async sendNotificationEmail(
    id,
    email,
    signInUrl,
    role
  ) {
    try {
      // Input validation
      if (!email) {
        throw new Error("Missing required parameters: email or schedules");
      }
      

      // Generate subject line
      const subject = `Complete Your Profile to Get the Best Experience - Lyalla and Lora`;

      const html =  `
      <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Incomplete Profile - Lyalla and Lora</title>
    <style>
    /* General Styles */
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 750px;
}

/* Center Wrapper */
.page-wrapper {
  min-height: 750px;
  width: 100%;
  max-width: 1400px; /* Or adjust to your preferred width */
  margin: 0 auto;
  background-color: #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Other existing styles (no changes required) */
.email-container {
  width: 96%;
  display: flex;
  flex-direction: row;
}

/* Header Section */
.header {
  background: #2290f3;
  color: white;
  text-align: left;
  width: 60%;
  height: 120px;
}

/* Image Section */
.header-image {
  width: 45%;
  height:160px;
  display: flex;
  background-color: white;
}

.header-image img {
  width: 100%;
}

/* Content Section */
.content {
  text-align: left;
  color: black;
}

/* Other content styles remain unchanged */


    .content h1 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .content h2 {
      font-size: 14px;
      margin-bottom: 0px;
    }

    .content p {
      font-size: 14px;
      line-height: 1.6;
    }

    .content ul {
      margin: 10px 0;
    }

    .content ul li {
      font-size: 14px;
      line-height: 1.6;
      list-style-type: disc;
    }

    .content ol {
      margin: 10px 0;
    }

    .content ol li {
      font-size: 14px;
      line-height: 1.6;
    }

    .cta-button {
      display: inline-block;
      background-color: #2290f3;
      color: white;
      text-decoration: none;
      padding: 0px 20px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 64px;
      text-align: center;
      margin-top: 20px;
    }

    .cta-button:hover {
      background-color: #207bd8;
    }

    .footer {
    color: black;
      text-align: left;
    }

    .footer p {
      font-size: 14px;
      margin: 5px 0;
    }
    .text{
      margin-top:20px;
    }

    /* Responsive Styles */
    @media (max-width: 768px) {
      

      .cta-button {
        font-size: 18px;
        color: #ffffff;
        padding: 20px 12px;
      }
    }

    @media (max-width: 480px) {
      .header,
      .content,
      .footer {
        text-align: left;
      }
      .text{
        margin-top:20px;
      }
      .content{
        width:100%;
      }
      .page-wrapper{
        width:100%;
      }

      .cta-button {
      align-items: center;
        display: block;
        width: 80%;
        text-align: center;
        padding: 8px 4px;
        
      }
        .email-container{
        width: 100%;
        }
    }
  </style>
  </head>
  
  <body>
  <div class="page-wrapper">
    
          
  
  
  
      <!-- Content Section -->
      
      <div class="text" style="color: #000000;"> <!-- Replace with actual color value -->
  
      <div class="content">
        <p style="color: #000000;"><b>Subject: </b>Complete Your Profile to Get the Best Experience - Lyalla and Lora</p>
        <p style="color: #000000;"><b>Dear User,</b></p>
        
        <p style="color: #000000;">We noticed that you registered on <b>${role === "DOCTOR" ? "AVA HEALTH" : "Lyalla and Lora"}</b> as a <b>${role === "DOCTOR" ? "DOCTOR" : "PATIENT"}</b> but your profile is incomplete. To ensure you get the best experience and access all features, please take a moment to complete your profile.</p>
  
        
        <p style="color: #000000;">If you have any questions or need assistance, feel free to contact us at sajeelashiq1@gmail.com </p>
        <p style="color: #000000;">We're here to support you every step of the way!</p>

  
        
      </div>
  
        <!-- Footer Section -->
        <div class="footer">
          <p>Warm Regards,</p>
          <p><b>The Lyalla and Lora Team</b></p>
        </div>
      </div>
    </div>
    </div>
  </body>
  </html>
  
    `

      // Send the email
      await sendMail({
        email: `AvaOne <${process.env.OAUTH_EMAIL}>`,
        sendTo: email,
        subject,
        text: subject, // Fallback plain text content
        html,
      });

      console.log(`Notification email sent successfully to ${email}`);
    } catch (error) {
      console.error("Failed to send notification email:", error);
      throw error;
    }
  }
}

export default NotificationSend;