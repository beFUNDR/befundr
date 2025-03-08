import { Enum } from "@solana/web3.js";

export class ProjectStatus extends Enum {
    static Draft = new ProjectStatus({ draft: "draft" });
    static Fundraising = new ProjectStatus({ fundraising: "fundraising" });
    static Realising = new ProjectStatus({ realising: "realising" });
    static Completed = new ProjectStatus({ completed: "completed" });
    static Abandoned = new ProjectStatus({ abandoned: "abandoned" });
    static Suspended = new ProjectStatus({ suspended: "suspended" });
}
