import nodemailer from "nodemailer";
import type { Account } from "../../model";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
export let getTransporter: nodemailer.Transporter;
export function createTransporter(host: string, port: number): void {
  console.log(`nodemailer url: ${host}:${port}`);
  getTransporter = nodemailer.createTransport({
    host,
    port,
  });
}

export const sendMail = (
  transporter: nodemailer.Transporter,
  receivers: Account[],
  sender: { email: string; username: string },
  subject: string,
  text: string
): void => {
  if (receivers.length == 0) return;
  const tos = receivers.map((e) => `${e.username} <${e.email}>`).join(", ");
  transporter
    .sendMail({
      to: tos,
      from: `${sender.username} <${sender.email}>`,
      subject,
      text,
    })
    .then((e) => {
      console.log(`mail sent: ${JSON.stringify(e)}`);
    })
    .catch((e) => {
      console.error(e);
    });
};
