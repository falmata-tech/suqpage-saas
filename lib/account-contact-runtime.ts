import type { AccountProfilePort, AccountContacts } from "./account-contacts";
import { runtimeGet, runtimeRun } from "./runtime-sql";

export const accountContactPort: AccountProfilePort = {
  read: (userId) => runtimeGet<AccountContacts>("SELECT email,account_phone FROM users WHERE id=?", [userId]),
  async savePhone(userId, phone) {
    return Number((await runtimeRun("UPDATE users SET account_phone=? WHERE id=?", [phone, userId])).changes) === 1;
  },
  async saveProfile(userId, name, phone) {
    return Number((await runtimeRun('UPDATE users SET name=?,account_phone=? WHERE id=?', [name, phone, userId])).changes) === 1;
  },
};
