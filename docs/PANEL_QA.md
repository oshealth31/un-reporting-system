# Panel Q&A

Short, honest answers for each audience. "Today" is what the repo does now. "Pilot" is what the 90 days would add. Where an answer depends on UN policy or systems that this project has not verified, it says so. Do not improvise on those.

## Resident Coordinator's Office

**Does this replace our reporting system?**
No. It sits beside it. Today it gives one view of the framework's indicators, funding and delivery, and a review queue for agency figures. Whether it should exchange data with UN INFO or another system is a question for the pilot. The API for that has not been built, and the UN INFO integration options have not been checked.

**Who decides what becomes an official figure?**
The RCO administrator. Agencies submit; nothing changes in any view until the administrator accepts it. Every submission and decision is logged with who and when.

**Can we see what changed and who changed it?**
Yes. The queue shows sender, source and date, and who decided. The administrator can read the audit log of sign-ins, submissions, decisions and refused actions.

## Agency heads and focal points

**More reporting work for my team?**
The pilot tests exactly this. The form takes one figure with its source, checks the range and unit, and warns on large jumps. CSV upload covers many rows at once. If it is more work than your current route, that is a pilot finding, not something to hide.

**Who else sees our numbers?**
While pending, only your agency and the RCO administrator see an update. After acceptance, it is visible to every signed-in role, because it becomes part of the shared results. Government and executive accounts cannot see anything pending.

**Can another agency submit for us?**
No. An agency lead can only submit for their own agency, and the server refuses anything else.

## Government partners

**What do we see, and can we change anything?**
Results, delivery, overview and reports, read only. Government accounts cannot submit or decide.

**Is our data in your hands?**
Nothing government-owned is stored in the prototype. In the pilot, any data the ministry shares would be agreed in writing first.

## Donors and executive viewers

**Is the data real?**
The 27 indicators are real and sourced to published UN reports. Funding, work plan and delivery are samples and say so on screen. In the pilot, agencies would replace the samples with their own figures.

**Can I get a report?**
Yes: a drafted summary that always matches the figures, which you can copy or print to PDF. The text comes from a fixed template today. A language model could draft it for different audiences, but that has not been built and would be reviewed by a person.

## UN IT, security and data protection

**Is it secure?**
It has been built with sign-in required for everything, scrypt password hashing, session cookies that scripts cannot read, lockouts, protection against forged requests, a strict content security policy, role checks on the server and an audit log, and 15 automated tests cover those. It has **not** had an independent security review, a penetration test or an accessibility audit. Those are in the pilot plan. See [`SECURITY.md`](../SECURITY.md) for the list of known limits.

**Does it support single sign-on or MFA?**
Not yet. Accounts are local to the server. SSO through the UN's identity provider and a second factor are the first items on the adoption roadmap, and the right protocol depends on what the UN's IT team uses.

**What personal data does it hold?**
Account name, work email, role and agency; the IP address and time of sign-ins in the audit log. No beneficiary data. A data protection assessment is part of the pilot.

**Where is it hosted? Who runs it?**
Any machine that runs Node 18. The pilot should be hosted where the UN approves, behind HTTPS. See [`DEPLOYMENT.md`](DEPLOYMENT.md). It stores data in plain files, which is fine for a pilot but not for adoption; see the roadmap.

**What if the builder disappears?**
The code is open (licence in the repo), has no third-party dependencies, builds with one command, and exports data as CSV. Any UN or partner developer can run and change it.

**Is it accessible?**
It uses semantic landmarks, labelled fields, visible keyboard focus and respects reduced-motion settings. An automated scan could not be run when this was built, and no assistive-technology testing has been done. A formal accessibility check is a pilot task.

## Operations and finance

**What does it cost to run?**
It needs one small server or container and no licences. Actual costs depend on where the UN wants it hosted and are not estimated here.

**What would adoption need beyond the pilot?**
A database instead of files, single sign-on, backups and monitoring, an independent security review, a named product owner, and a support arrangement. See [`ROADMAP.md`](ROADMAP.md).

## Questions to ask the panel back

1. Which two or three indicators would you most like to see move from "no data" to "tracked"?
2. Who in each agency would own the figures?
3. What would make you stop the pilot at day 45?
4. Which system must this exchange data with, if any?
