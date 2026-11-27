# Course content audit: citations and claims, sessions 1 to 13 (English)

Date: 2026-11-27. Scope: `content/course/session-01.md` to `session-13.md`, participant and facilitator parts.
Report only. No content file and no `status` was changed. Every change below has to be mirrored in the
matching `.es.md` file (CONTRIBUTING.md), and Irwin and a pastor sign off.

## Summary

| Session | Sources + Bible refs checked | Wrong | Unverifiable | Minor | Ready for pastoral review |
|---|---|---|---|---|---|
| 01 Where did these documents come from? | 5 sources, 6 refs | 0 | 0 | 5 | Yes |
| 02 In what sense is this "God's word"? | 8 sources (+ Calvin), 5 refs | 0 | 0 | 6 | Yes |
| 03 Who was Jesus, as a matter of history? | 8 sources, 6 refs | 0 | 0 | 4 | Yes |
| 04 The world he walked into | 8 sources, 4 refs | 0 | 0 | 5 | Yes |
| 05 His actual message: the kingdom of God | 7 sources, 6 refs | 1 | 0 | 2 | No (one relabel) |
| 06 The hard teachings: did he mean it? | 7 sources, 9 refs | 0 | 1 | 4 | Yes |
| 07 Why he ate with the wrong people | 5 sources, 7 refs | 0 | 1 | 2 | Yes |
| 08 Why he was killed | 6 sources, 10 refs | 0 | 0 | 3 | Yes |
| 09 The resurrection | 11 sources, 4 refs | 1 | 0 | 4 | No |
| 10 What his death was meant to mean | 6 sources, 9 refs | 2 | 0 | 1 | No (two quick fixes) |
| 11 Follow him and still doubt? | 5 sources, 5 refs | 0 | 0 | 1 | Yes |
| 12 Prayer, silence, and Scripture | 6 sources, 3 refs | 0 | 0 | 2 | Yes |
| 13 The church: why bother? | 5 sources, 4 refs | 0 | 0 | 3 | Yes |

Severity key: **Wrong** = a fact, citation detail, or confidence label that is incorrect and would mislead.
**Unverifiable** = a specific attribution I could not confirm from records; check the book before printing.
**Minor** = house-style issue (non-standard label, missing year, jargon) or a label that is a notch too strong.

**Headline:** the bibliographies are in good shape. Every book cited exists, with the right author, title,
publisher and year, apart from the Aulén date in session 10 and some missing years in session 4. No
invented citations were found. The real problems are a few confidence labels that are stronger than the
field, one misdescribed scholar (Allison, session 9), and a house-wide habit of using labels outside the
five allowed ones.

**Em dashes:** none in any rendered text. The only em dashes are in the `source:` frontmatter line of each
file, which the test suite deliberately strips because it is never shown (`tests/content.test.ts`, "keeps
the course free of em dashes"). No action needed.

## Cross-cutting issues (apply to several sessions)

1. **Labels outside the five.** EDITORIAL.md allows only consensus, strong majority, debated, our read
   (`[my read]`), rejected. These do not render as badges (`LABEL_RE` in `src/lib/content.ts` ignores them)
   and print as raw bracket text:
   - `[one major view]`: s01 lines 32, 79; s04 lines 31, 79; s09 lines 104, 108, 116.
   - s02 lines 28, 29, 30, 31, 70, 75, 80-82, 84-85, 95-96 (`[the plain reading of John 1...]`,
     `[Barth's model; one major view]`, `[two major views...]`, `[near consensus as a method]`, and
     source names placed inside label brackets).
   - s03 line 99 `[the criteria were standard; see the caution below]`; s06 line 78 `[the social setting is
     strong majority...]`; s09 line 113 `[a real position, not a fudge]`.
   - Fix: `[one major view]` usually means `[debated: ...]` (when there is a named rival view) or
     `[strong majority]`. Move source names out of the brackets into the sentence ("Barth calls this...").
2. **Labels wrapped across a line break**, which CONTRIBUTING.md says not to do: s02:80, 84, 95; s03:99;
   s04:72, 86, 93; s06:78, 92; s07:70, 77; s08:81; s10:88, 94; s12:78; s13:77. They currently render
   because the regex spans newlines, but the Spanish translation rule depends on them staying on one line.
3. **Luke 23:34 ("Father, forgive them")** is used in s06 and s08 without noting that it is missing from
   several of the earliest manuscripts (P75, Codex Vaticanus, first hand of Codex Bezae; see Metzger,
   *Textual Commentary*, on Luke 23:34). Session 1 teaches textual honesty, so add "(a line some early
   copies lack)" in the facilitator notes.

## Session-by-session flags

### Session 01

Checks out: Metzger and Ehrman, *Text of the NT*, 4th ed. (OUP, 2005); Ehrman, *The New Testament*, 7th ed.
(OUP, 2019, confirmed: https://learninglink.oup.com/access/ehrman-nt7e); Bruce, *Canon of Scripture* (IVP,
1988); Hengel, *Four Gospels* (Trinity Press International / SCM, 2000, confirmed:
https://openlibrary.org/isbn/1563383004); Irenaeus, *Against Heresies* 3.1.1 (names all four) and 3.11.8
(argues for exactly four). Luke 1:1-4 NRSV quote is accurate. Mark 16:9-20 and John 7:53-8:11 are the right
examples. Dating (70 to 100 CE, Mark first, Paul in the 50s) is correctly [consensus].

| Line | Quote | Problem | Suggested fix | Severity |
|---|---|---|---|---|
| 31, 75 | "No teaching of the church rests on a disputed reading. *[consensus]*" | A common claim, but Ehrman (one of the cited authors) argues the opposite in *Misquoting Jesus* (2005). Not consensus. | `[strong majority]`, or "No central Christian belief depends on a disputed verse" with `[strong majority]`. | Minor |
| 32, 79 | `[one major view]` | Not one of the five labels. | `[strong majority]` (the "ancient historiography" reading of Luke is the mainstream view). | Minor |
| 70 | `[consensus / debated]` | Renders as a Consensus badge with "/ debated" as a note: reads oddly. | Split into two labelled sentences. | Minor |
| 81 | "Introduce the three confidence labels here" | There are five. | "Introduce the five confidence labels here." | Minor |
| 89 | "it's all Chinese whispers" | British idiom with an ethnic tag; US readers may not know it. | "it's all a game of telephone." | Minor |

### Session 02

Checks out: Enns, *Inspiration and Incarnation*, 2nd ed. (Baker Academic, 2015); Enns, *The Bible Tells Me So*
(HarperOne, 2014); Barth, *CD* I/1 §4 "The Word of God in Its Threefold Form" (T&T Clark, 1975, Bromiley
trans.); Luther, Preface to the Old Testament (1523), *LW* 35 (the "swaddling clothes and the manger" image is
there); Wright, *Scripture and the Authority of God*, rev. ed. (HarperOne, 2011); Borg, *Reading the Bible
Again* (HarperSanFrancisco, 2001); Walton, *Lost World of Genesis One* (IVP Academic, 2009); Chicago Statement
(1978). John 1:1, 14 and Luke 24:27 quotes match NRSV.

| Line | Quote | Problem | Suggested fix | Severity |
|---|---|---|---|---|
| 80 | "Calvin said God 'lisps' to us the way a nurse talks to an infant. *[Enns, ...]*" | Quote is real but its source is Calvin, *Institutes* 1.13.1, not Enns, and Calvin is not in the source list. | Add "John Calvin, *Institutes of the Christian Religion* 1.13.1" to Sources. | Minor |
| 22 | "**2 Timothy 3:16-17**: 'All scripture is inspired...'" | Heading says 16-17 but only verse 16 is quoted. | Change heading to 3:16. | Minor |
| 88, 31 | "Genesis 1 is a tightly built poem" under "near consensus" | Most specialists call Genesis 1 elevated or structured prose narrative, not poetry. Walton (cited) reads it as an ancient cosmology text about function, not a poem. | "a tightly built, rhythmic text (seven days, forming then filling, a refrain)". | Minor |
| 28-31, 70-96 | Ten non-standard labels | See cross-cutting issue 1. | Use the five labels; move source names out of brackets. | Minor |
| 130 | *Luther's Works*, vol. 35 (Fortress Press) | No year. | (Muhlenberg/Fortress, 1960). | Minor |
| 28-29 | "Scripture", "Trinity" in participant text | Church words used without a same-breath gloss (EDITORIAL "Plain"). | "Scripture (the Bible)". | Minor |

### Session 03

Checks out: Tacitus quote matches the standard Church and Brodribb translation of *Annals* 15.44, including
"a most mischievous superstition"; Josephus *Ant.* 18.3.3 and 20.9.1 (Whiston numbering; 18.63-64 and 20.200
in Loeb), and the James wording matches Whiston. Sanders, *Historical Figure of Jesus* (Penguin, 1993); Meier,
*A Marginal Jew* vols. 1-5 (Doubleday 1991-2001, Yale 2009-2016); Allison, *Constructing Jesus* (Baker
Academic, 2010); Keith and Le Donne, eds. (T&T Clark, 2012); Ehrman, *Did Jesus Exist?* (HarperOne, 2012);
France, *Mark*, NIGTC (Eerdmans, 2002). Mark 1:9-11 NRSV accurate. The Luke detail (baptism mentioned after
John's imprisonment, Luke 3:20-21) and John's Gospel not narrating it are correct. The "core facts" list is
fairly marked [consensus].

| Line | Quote | Problem | Suggested fix | Severity |
|---|---|---|---|---|
| 69-70 | "in a baptism the other Gospels describe as being about repentance" | Mark itself says so (Mark 1:4), which is the stronger point. | "in a baptism Mark himself calls 'a baptism of repentance' (1:4)". | Minor |
| 29 | "*[consensus that Josephus wrote something; debated exactly what]*" | A small but real minority (e.g. Ken Olson) argue the whole Testimonium is a later insertion. | `[strong majority: Josephus wrote something; debated: exactly what]`. | Minor |
| 28 | "one of our procurators, Pontius Pilatus" | Accurate quote, but Pilate's own inscription (the Pilate Stone, Caesarea) calls him prefect. A sharp participant may raise it. | Facilitator note: "Tacitus uses the later title; Pilate's own inscription calls him prefect." | Minor |
| 99 | `[the criteria were standard; see the caution below]` | Non-standard label. | `[strong majority: the criteria were standard for decades]`. | Minor |

### Session 04

Checks out: Sanders, *Judaism: Practice and Belief* (SCM / TPI, 1992); Sanders, *Jesus and Judaism* (Fortress,
1985); Bailey, *Poet and Peasant and Through Peasant Eyes*, combined ed. (Eerdmans, 1983, confirmed:
https://libcat.library.tamu.edu/Record/in00000510165/Description); Bailey, *Jacob and the Prodigal* (IVP, 2003);
Levine, *Short Stories by Jesus* (HarperOne, 2014); Snodgrass, *Stories with Intent* (Eerdmans, 2008). Luke 15
NRSV quotes accurate. "Who invited him to dinner repeatedly in Luke" checks out (Luke 7:36; 11:37; 14:1).
Bailey's running-father reading is correctly presented as one scholar's view, and the Levine objection is a
fair summary of her argument.

| Line | Quote | Problem | Suggested fix | Severity |
|---|---|---|---|---|
| 124 | Malina, *The New Testament World* (Westminster John Knox Press) | No year or edition (EDITORIAL requires year). | 3rd ed., rev. and expanded (Westminster John Knox, 2001). | Minor |
| 125 | Levine and Brettler, *The Jewish Annotated New Testament* (OUP) | No year. | 2nd ed. (Oxford University Press, 2017). | Minor |
| 32, 93 | Pharisees "a serious renewal movement trying to help ordinary people live faithfully... *[consensus]*" | "Not villains" is consensus. Their exact program and influence are debated (Sanders vs. Neusner on table purity and how many lay followers they had). | `[strong majority]`, or keep consensus only on "not villains". | Minor |
| 72 | "*[consensus on honor and shame as the operating social system]*" | The honor/shame model (Malina) is widely used but has real critics on how far it explains first-century Judea. | `[strong majority]`. | Minor |
| 31, 79 | `[one major view, associated with Kenneth Bailey]` | Non-standard label. | `[debated: Bailey's reading; others doubt modern village life is a safe guide]`. | Minor |

### Session 05

Checks out: Sanders, *Jesus and Judaism* (1985); Wright, *Jesus and the Victory of God* (Fortress, 1996); Meier
vol. 2, *Mentor, Message, and Miracles* (Doubleday, 1994); Allison, *Constructing Jesus* (2010); Davies and
Allison, *Matthew* vol. 1, ICC (T&T Clark, 1988); Pennington, *Sermon on the Mount and Human Flourishing* (Baker
Academic, 2017); Ignatius, *Spiritual Exercises*. Isaiah 52:7 "your God reigns", Luke 11:20 (close to RSV),
Matthew 5:5 quoting Psalm 37:11, and Herod Antipas ruling Galilee are all correct.

| Line | Quote | Problem | Suggested fix | Severity |
|---|---|---|---|---|
| 74-76 | "Matthew's 'kingdom of heaven' is the same thing in a more reverent Jewish idiom that avoids saying God's name directly... *[consensus]*" | Mislabelled, and contradicted by a source the session itself cites. Pennington's main academic work argues this "reverential circumlocution" view is wrong (Matthew uses "God" freely, including "kingdom of God" four times). Evidence: https://bakerpublishinggroup.com/books/heaven-and-earth-in-the-gospel-of-matthew/315640 | Keep "same reality, not a different place" as [consensus]; mark the "avoids God's name" explanation `[debated: older view; Pennington argues Matthew is contrasting heaven and earth]` and add Pennington, *Heaven and Earth in the Gospel of Matthew* (Brill, 2007; Baker, 2009). | Wrong |
| 90-96, 111-112 | "Matthew and Luke each draw on a shared source... *[consensus that both edited a shared tradition]*" and "neither copied the other here; both shaped a common source" | The shared source (Q) is the majority view, but the Farrer hypothesis (Goodacre and others) holds that Luke used Matthew. Stating "neither copied the other" as fact overreaches. | `[strong majority]`; in the objection: "Most scholars think neither copied the other here..." | Minor |
| 29 | "It appears far more often in his sayings than any other phrase." | Fine as a claim of centrality; "any other phrase" is hard to count. | "It is the theme he returns to most." | Minor |

### Session 06

Checks out: Wink, *Engaging the Powers* (Fortress, 1992); Luz, *Matthew 1-7*, rev. ed., Hermeneia (Fortress,
2007); Davies and Allison vol. 1 (1988); Betz, *Sermon on the Mount*, Hermeneia (Fortress, 1995); Stassen, "The
Fourteen Triads of the Sermon on the Mount (Matthew 5:21-7:12)," *JBL* 122/2 (2003): 267-308, confirmed
(https://sbl-site.org/assets/pdfs/Stassen_Transforming.pdf); Hays, *Moral Vision* (HarperSanFrancisco, 1996).
Exodus 21:24, Leviticus 24:20, Deuteronomy 19:21 (eye for eye); Exodus 22:26-27 (cloak returned by sunset);
Matthew 27:32 uses the same verb (*angareuō*) as 5:41; Matthew 5:45, 5:48 are correct.

| Line | Quote | Problem | Suggested fix | Severity |
|---|---|---|---|---|
| 84-86 | "some scholars (Luz, for example) think Wink makes the scenes more tactical than Matthew intended" | Could not confirm that Luz's commentary engages Wink in these terms (search found Wink critics, not Luz's text). | Check Luz, *Matthew 1-7*, on 5:38-42 before printing; if it isn't there, name Hays (*Moral Vision*), who does discuss nonviolence, or say "some scholars" without a name. | Unverifiable |
| 31 | Right-cheek backhand "*[strong majority]*" | That the slap is an insult, not an injury, is widely held (Davies and Allison). The specific backhand and status reading is Wink's and contested. | Split: insult `[strong majority]`; backhand-from-a-superior `[debated]`. | Minor |
| 75-76 | "leaves you naked in court, which in that culture shamed the onlooker more than the naked person" | This is Wink's specific claim, but it sits under a strong-majority label. | Attribute to Wink in the sentence. | Minor |
| 98 | "prayed for his executioners (Luke 23:34)" | Textually uncertain verse; see cross-cutting issue 3. | Add a short note. | Minor |
| 134 | "Check the worksheet's 'citations-checked: partial' items" | Refers to a worksheet that isn't in the repo; a reader can't act on it. | Remove, or link the worksheet. | Minor |

### Session 07

Checks out: Sanders (1985); Blomberg, *Contagious Holiness: Jesus' Meals with Sinners*, NSBT 19 (Apollos / IVP,
2005); Levine, *The Misunderstood Jew* (HarperSanFrancisco, 2006); Meier vol. 3, *Companions and Competitors*
(Doubleday, 2001); France (2002). Mark 2:1-3:6 controversy cycle; Matthew 11:19 // Luke 7:34; Luke 13:31
(Pharisees warn him); Nicodemus at the burial (John 19:39; a Pharisee per John 3:1); Zacchaeus (Luke 19). The
Sanders "sinners" thesis is correctly marked [debated].

| Line | Quote | Problem | Suggested fix | Severity |
|---|---|---|---|---|
| 77-78 | "'contagious holiness' is Craig Blomberg's phrase" | Blomberg used it as his 2005 book title, but the idea (holiness flowing outward, not impurity) is older and widely credited to Marcus Borg's work in the 1980s. I could not confirm who coined the phrase. Evidence: https://mitpressbookstore.mit.edu/book/9780830826209 (Blomberg's book), no coinage source found. | "'Contagious holiness', the title of Craig Blomberg's study, is a fair summary..." | Unverifiable |
| 70 | "Levi would have been rich and resented." | Galilean toll collectors were often modest contractors, not wealthy (Meier, vol. 3, discusses this; the file itself says "check against Meier"). | "Levi would have been resented, and may have done well out of it." | Minor |
| 85-88 | Pharisees "a popular lay movement... *[consensus among scholars]*" | How popular, and how lay, is debated (as in s04). | `[strong majority]`. | Minor |

### Session 08

Checks out: Sanders (1985); Brown, *The Death of the Messiah*, 2 vols. (Doubleday, 1994); Hengel, *Crucifixion
in the Ancient World* (Fortress, 1977); Fredriksen, *Jesus of Nazareth, King of the Jews* (Knopf, 1999);
Wright (1996); *Nostra Aetate* §4 (1965), which does reject collective Jewish guilt. Isaiah 56:7 and Jeremiah
7:11 (and Jeremiah 7:14 on the temple's fall); Mark 15:26 (the charge); Mark 15:34, John 19:30; Mark 14:36. The
"[rejected]" label on "the Jews killed Jesus" is used exactly as intended.

| Line | Quote | Problem | Suggested fix | Severity |
|---|---|---|---|---|
| 110 | "He refused armed revolt (Mark 14:48; session 6)" | Mark 14:48 is Jesus protesting being arrested "as though I were a bandit"; it implies, but doesn't show, refusal. | Cite Matthew 26:52 ("Put your sword back") or Luke 22:51 alongside it. | Minor |
| 34, 81 | "temple incident was the trigger *[strong majority]*" | Defensible, but Fredriksen (cited) is a prominent dissenter: she doubts the temple action was the cause. | Add "(Fredriksen, cited below, disagrees)". | Minor |
| 93 | "'Father, forgive them'" | Textually uncertain; see cross-cutting issue 3. | Short note. | Minor |

### Session 09

Checks out: 1 Corinthians 15:3-8 and Mark 16:8 NRSV quotes accurate; Matthew 28:11-15 as the stolen-body story.
Wright, *Resurrection of the Son of God* (Fortress, 2003); Allison, *Resurrection of Jesus* (T&T Clark, 2021)
and *Resurrecting Jesus* (T&T Clark, 2005); Ehrman, *How Jesus Became God* (HarperOne, 2014); Lüdemann,
*Resurrection of Jesus* (Fortress, 1994); Sanders (1993); Habermas and Licona (Kregel, 2004); Licona (IVP
Academic, 2010); Thiselton, NIGTC (Eerdmans, 2000); Yarbro Collins, Hermeneia (Fortress, 2007); Metzger,
*Textual Commentary*, 2nd ed. (UBS, 1994). The Sanders paraphrase matches his wording in *Historical Figure*
("That Jesus' followers... had resurrection experiences is, in my judgment, a fact. What the reality was that
gave rise to the experiences I do not know"). The "within a few years" caution on the formula is good practice.

| Line | Quote | Problem | Suggested fix | Severity |
|---|---|---|---|---|
| 109-112 | "Dale Allison has spent decades on this and remains openly unresolved... he shows a person can look at all of it carefully and not land." | Misdescribes a named scholar. In the 2021 book Allison says plainly "I believe that the disciples saw Jesus and that he saw them," and he judges the tomb probably empty. What he refuses to claim is that history alone can prove it. Evidence: https://www.churchtimes.co.uk/articles/2021/23-april/books-arts/book-reviews/the-resurrection-of-jesus-apologetics-polemics-history-by-dale-c-allison-jr ; preface quoted at https://ptsem.edu/?p=1196 | "Dale Allison has spent decades on this. He is a Christian who believes the disciples really saw Jesus, and he thinks the tomb was probably empty, but he argues that history alone can't settle it and that both the skeptical and the apologetic cases are often overstated." | Wrong |
| 40, 88 | "that early list does not contain: no empty tomb... *[consensus that they are separate strands]*" | Many scholars (Wright, Hays, Allison) argue "he was buried... he was raised" implies an empty tomb. "Separate strands" is a strong majority working method, not consensus. | `[strong majority]`, plus: "though many think 'buried, then raised' assumes an empty tomb." | Minor |
| 41 | "several of them died for it... *[consensus]*" | That they believed it is consensus. The deaths of particular apostles rest on later tradition of mixed strength (James son of Zebedee in Acts 12 and James the brother in Josephus are the solid ones). | Move the deaths into their own sentence with `[strong majority]`, or "some of them were later killed". | Minor |
| 91-92 | "in Jerusalem, where the claim could be checked... *[consensus]*" | "Could be checked" is an apologetic inference, not part of the consensus list. | Drop the clause or label it `[our read]`. | Minor |
| 104, 108, 113, 116 | `[one major view]`, `[a real position, not a fudge]` | Non-standard labels. | Use `[debated: ...]` once for the whole range, or `[our read]` for the Allison framing. | Minor |

### Session 10

Checks out: Green and Baker, *Recovering the Scandal of the Cross*, 2nd ed. (IVP Academic, 2011); Rutledge, *The
Crucifixion* (Eerdmans, 2015); McKnight, *A Community Called Atonement* (Abingdon, 2007); Wright, *The Day the
Revolution Began* (HarperOne, 2016); Anselm, *Cur Deus Homo* (c. 1098). Every picture is matched to the right
verse: Mark 10:45 (and 10:35-45), Hebrews 9, Colossians 2:14 and 2:15, 2 Corinthians 5:18-21 and 5:19, 1 Peter
2:21, Acts 8:32-35, Isaiah 52:13-53:12, Romans 3:21-26.

| Line | Quote | Problem | Suggested fix | Severity |
|---|---|---|---|---|
| 137 | "Gustaf Aulén, *Christus Victor* (1931; English translation SPCK, 1931)." | Wrong original date. The Swedish original (*Den kristna försoningstanken*, from Uppsala lectures) appeared in 1930; A. G. Hebert's English translation is SPCK, 1931. Evidence: https://en.wikipedia.org/wiki/Gustaf_Aul%C3%A9n ; https://viaf.org/viaf/306889419 | "Gustaf Aulén, *Christus Victor: An Historical Study of the Three Main Types of the Idea of the Atonement*, trans. A. G. Hebert (SPCK, 1931; Swedish original 1930)." Then remove the line 141 note. | Wrong |
| 50-51 | "Last session established that Jesus was executed, and session 9 that his followers said he rose." | Wrong cross-reference: the execution was session 8, and "last session" is session 9. | "Session 8 established that Jesus was executed, and last session that his followers said he rose." | Wrong |
| 30, 77 | "No single 'theory' of the cross is the New Testament's own. *[consensus]*" | Many conservative scholars argue penal substitution is the New Testament's central model (e.g. Jeffery, Ovey and Sach, *Pierced for Our Transgressions*, 2007). | `[strong majority]`, and say some traditions hold one model to be central. | Minor |

### Session 11

Checks out: Bates, *Salvation by Allegiance Alone* (Baker Academic, 2017); Morgan, *Roman Faith and Christian
Faith* (OUP, 2015); Enns, *The Sin of Certainty* (HarperOne, 2016); Mother Teresa, *Come Be My Light*, ed.
Kolodiejchuk (Doubleday, 2007); Luz, *Matthew 21-28*, Hermeneia (Augsburg Fortress, 2005). Mark 9:24, Matthew
28:17 (*distazō*), John 20:25, Psalm 13:1 and 13:5 are correctly quoted. Mother Teresa's letters do describe
decades of feeling God's absence.

| Line | Quote | Problem | Suggested fix | Severity |
|---|---|---|---|---|
| 72-73 | "Matthew Bates has argued this at length... *[strong majority]*" | The broad point (pistis includes trust and loyalty) is strong majority, as Morgan shows. Bates's specific "allegiance" thesis is debated. | Keep the label on the broad point; add "Bates's stronger version is debated". | Minor |

### Session 12

Checks out: Jeremias, *The Prayers of Jesus* (SCM, 1967); Barr, "'Abbā Isn't 'Daddy'," *JTS* n.s. 39 (1988):
28-47, confirmed (https://ibl.kb.nl/article/0000000080124/XXVIII/1/2) so the "check the Barr pages" note can
go; Guigo II, *Ladder of Monks* (12th century; the four steps are right); Foster, *Celebration of Discipline*
(Harper & Row, 1978); Davies and Allison vol. 1 (1988). Matthew 6:9-13 and Luke 11:1-4 renderings are fair. The
Jeremias/Barr correction is accurately told.

| Line | Quote | Problem | Suggested fix | Severity |
|---|---|---|---|---|
| 118 | Willard, *The Spirit of the Disciplines* (HarperSanFrancisco, 1988) | The 1988 first edition is Harper & Row, San Francisco; the HarperSanFrancisco imprint came with later printings (1990 on). Evidence: https://dwillard.org/books/spirit-of-the-disciplines | (Harper & Row, 1988). | Minor |
| 78-79 | "*[strong majority on the directness; the 'daddy' claim is rejected by most scholars now]*" | A second claim buried in one label; "rejected" is a label of its own. | Two labels: `[strong majority]` on the directness and `[rejected]` on "abba means daddy". | Minor |

### Session 13

Checks out: Stark, *The Rise of Christianity* (Princeton UP, 1996); Hurtado, *Destroyer of the Gods* (Baylor UP,
2016); Holland, *Dominion: How the Christian Revolution Remade the World* (Basic Books, 2019, the US title);
McKnight and Barringer, *A Church Called Tov* (Tyndale, 2020); Fee, NICNT rev. ed. (Eerdmans, 2014). Acts
2:42-47, 1 Corinthians 12:22, and 1 Corinthians 11:17-22 are correct. "No buildings for about two centuries"
is fair (the earliest known church, at Dura-Europos around 240, was a converted house).

| Line | Quote | Problem | Suggested fix | Severity |
|---|---|---|---|---|
| 82-84 | "Tom Holland's *Dominion* traces how deeply Christian ideas... shaped the West... *[consensus]*" | That the church did harm and Christians also led reform is consensus. Holland's thesis is a popular, contested argument. | Keep [consensus] on the record; tag Holland `[debated]` or `[our read]`. | Minor |
| 89 | "The vault's own principle applies" | Internal jargon: "the vault" means nothing to a facilitator outside the team. | "A principle this course holds: a decision with no community leads nowhere." | Minor |
| 9 | `nextStep: ""` | Empty field; the next step lives in the body. | Fill it ("Come to one gathering of the wider church."), or confirm the app handles an empty value. | Minor |

## Top five to fix first

1. **s09, Allison misdescribed** (Wrong). He believes the disciples saw Jesus and thinks the tomb was probably
   empty; the session says he "does not land".
2. **s05, "kingdom of heaven" circumlocution marked [consensus]** (Wrong). It is debated, and the session's
   own cited author, Pennington, is the main critic.
3. **s10, Aulén date** (Wrong). Swedish original 1930, Hebert translation SPCK 1931.
4. **s10, session cross-reference** (Wrong). The execution was session 8, not "last session".
5. **House-wide non-standard labels** (Minor, but in 5 sessions and a stated house rule): `[one major view]`
   and other free-text brackets in s01, s02, s03, s04, s09 don't render as badges.

Also worth fixing before print: the unconfirmed Luz/Wink attribution (s06), the "contagious holiness"
coinage (s07), and the Luke 23:34 textual note (s06, s08).
