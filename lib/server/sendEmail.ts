import sgMail from "@sendgrid/mail"
import marked from "marked"
import { PRIMARY_COLOR } from "../theme"

export interface SendEmailArgs {
  to: string
  subject: string
  text: string
}

export function sendEmail({ to, subject, text }: SendEmailArgs) {
  // send email
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || "")

  const html = wrapWithTemplate(marked(text))

  const msg = {
    to,
    from: "noreply@status-monitor.app",
    subject,
    text,
    html,
  }
  return sgMail.send(msg)
}

const wrapWithTemplate = (
  body: string
) => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width" />

    <style type="text/css">

        .email-content a, .email-content a:visited {
            color: ${PRIMARY_COLOR};
        }

        .email-content h1 a {
            cursor: pointer;
            white-space: nowrap;
        }

        .email-content h1 a {
            font-weight: 500;
            font-size: 14px;
            line-height: 14px;
            letter-spacing: 0.03em;
            text-transform: uppercase;
            display: inline-block;
            text-decoration: none;
            text-align: center;
            border-radius: 3px;
            padding: 10px 25px;

            border-top: 1px solid ${PRIMARY_COLOR};
            border-left: 1px solid ${PRIMARY_COLOR};
            border-right: 1px solid ${PRIMARY_COLOR};
            border-bottom: 1px solid ${PRIMARY_COLOR};
            color: #FFF;
            background-color: ${PRIMARY_COLOR};
        }

        .email-content {
            text-align: left;
            max-width: 600px;
            font-size: 13px;
        }

        .outer-table {
            width: 100%;
        }

    </style>

</head>
<body>
<table class="outer-table" cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td>

            <center>
                <!--[if mso]><table><tr><td class="mui-container-fixed"><![endif]-->
                <div class="email-content">
                    ${body}
                    <center>
                        <!-- Keep Apple Dark Mode from activating
                        https://www.maildesigner365.com/the-secret-to-building-dark-mode-email-newsletters-for-macos-mojave-mail/ -->
                        <image style="display: none;" src="https://www.etix.com/ticket/online3/images/etix-logo.svg" width="150"></image>

                        <!-- LOGO -->
                        <br/>
                        <br/>
                        
                    </center>
                    <img src="https://status-monitor.app/logo.png" alt="logo" style="display: inline;" >

                </div>
                <!--[if mso]></td></tr></table><![endif]-->
            </center>

        </td>
    </tr>
</table>



</body>
</html>
`
