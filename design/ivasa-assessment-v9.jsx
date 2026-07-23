import { useState, useEffect, useRef } from "react";

/* ============================================================
   iVASA Assessment — flow prototype v13
   v13: emerald reversed on line 2 — "See (" and ") beneath..."
   are emerald, "the pattern" is white; period replaced with an
   ellipsis; line 1 shortened to "Real Mental Health Therapy:".
   v12: parentheses stay white — only "the pattern" is emerald;
   chip is now "✦ Free profile, no credit card".
   v11: literal parentheses in hero line 2 — "See (the pattern)
   beneath." with "(the pattern)" incl. parens in emerald.
   v10: hero is now two lines — "Real Mental/Behavioral Health
   Therapy:" (larger) over "See the pattern beneath." (smaller,
   'the pattern' in emerald); chip is "Free profile"; trust
   signal "1,000+ Ai sessions conducted" replaced with
   "Safety-First (Non-Crisis Therapy)".
   v9: header icon reduced to 22px so the wordmark leads;
   headline now "See beneath the pattern you've been running"
   with 'pattern' as the highlighted word.
   v8: headline fixed to "A guide that sees beneath the pattern
   you've been running" (rotating verb removed — 'names/works
   beneath' didn't read); primary action buttons recolored to
   brand purple #8130E6 with white label text.
   v7: explee-style header — the uploaded VASA icon mark (left) +
   a typed lowercase wordmark, set in DM Sans, which is also now
   the UI typeface throughout to match explee's type feel.
   The previous full-lockup logo is removed.
   Changes from v3 (per founder feedback):
   · q6: "A drag sets in —" phrase removed; "Mostly, I just move
     toward it" option removed entirely (4 options now)
   · q4: "When do you notice?" merged into the main question
   · q5: "The wanting is real." removed
   · Agent card: "Already drafting your profile / What it looks like:"
   · q8 KEPT (founder deferred): it is one third of the
     follow-through score — removing it without rewriting the
     scoring math would push nearly everyone into "wide gap"
     patterns — and it is the loop question, the most
     distinctive item in the set
   · q9: "When something happens that you don't want — what
     happens first?"
   · Draw: "The next 3 months — if YOU do nothing"
   · Gender + age questions REMOVED → 7 questions total
   Answer VALUES unchanged → scoring + webhook intact
   (gender/age simply arrive as 'not_provided').
   ============================================================ */

/* ---------- brand tokens ---------- */
const T = {
  bg: "#0b0a16",
  glowA: "rgba(76, 44, 130, 0.35)",
  glowB: "rgba(16, 185, 129, 0.08)",
  panel: "rgba(22, 19, 40, 0.72)",
  line: "rgba(148, 163, 184, 0.16)",
  lineSoft: "rgba(148, 163, 184, 0.10)",
  em: "#10b981",
  emBright: "#34d399",
  emSoft: "rgba(16, 185, 129, 0.12)",
  emLine: "rgba(16, 185, 129, 0.35)",
  vio: "#a78bfa",
  vioDeep: "#8b5cf6",
  btn: "#8130e6",
  btnBright: "#9a55f0",
  btnLine: "rgba(129, 48, 230, 0.45)",
  vioLine: "rgba(139, 92, 246, 0.35)",
  ink: "#f4f4f6",
  mute: "#9aa3b2",
  faint: "#6b7280",
};
const MONO =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

/* VASA icon mark — uploaded asset, transparent background */
const ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKEAAAChCAYAAACvUd+2AAAcYUlEQVR42u2deXhUVZ73P6eW7PtiSAKhyYJA6GZITFiUNIsIjSDSMsooLTaOtoAjzKvt+jZuDyq2vi/aAjbT0KLooK89yiIDIhiDyhISGscgEgLNlhBJAtmXSuq+f1QBdW9VQgKpe28l9/s8eZI691bq1Dmf+zvb7/yOkCRJwiHJ+eMq5euupPXW99uBc0Cp86fM5e9S4AxwQghhxxAAwgVCQ+qpFigE9gP5wH4hRIkBoSGtdd4J5T7gM2Bvb7GWBoT6VTmwEdgAfCGEaO41EN4R8t7li8LDGwSdTGzv/Z4Suab3t/PxHv9vl96P6GSeLv9tspiIjAskMj6QqIQgouIDiYoPIjLe8XfcgFDCov27Wk91wFYnkBuFEDU9GsJfB71r2CAv67r+IaRkRJOaGUNqRjQpGVEEhfl19u31wHvAW0KIIgNCQ91TCQLiU8NIuyGGjEmJZE5O7CyUucCfgA1CiDYDQkPdJrPVxNCcOEZMSyJ7aj+iEoKu9JZTwNvAKiFEhQGhoW63ksnDoxkxLYlxs1OITgy6Ut/xdeA1IUSdAaGh7reQFkH21CSmzBtE+pi4K42sX3BaxlYDQkNeUdKQCKbMG0TOrGQCgi3t3VYMPC2E+NiA0JDXFBzux4Q5qcx4dCjhsQHt3bYXWCiE2GtAaMhrCgy1Mn1hOrctHNKeZWwDXgOe1dvEtwFhD1NEXCCz/vcwJsxJw2zxOAtfBMwRQhQYEBryqhIHhjH7hQxG3Jbk6XIr8DLwohDCZkBoyKsaNiGeBStHE9M32NPlvzut4nda5tFkVFPP1sEdZSy6YSM71h71dPmfgL2SJM02IDTkVTXU2Fg+71uW/Hon5882Ki8HAO9JkvSKJEkmA0JDXlXB1tMszNhA3vpjni4/AWyQJCnUgNCQV1V3oYVlc79m2dyvsTW5+TxMBXZLkpRsQGjI68pbf4xnJm6jqqxBeSkd2CdJ0lgDQkNe19GCCh6/aQtHC9wcb6KBrZIk/cqA0JDXVVXWwDMTt7Hro+PKS/7AJ2qAaEBoCFtTG//3vl28/9wBFDuOVAHRgNDQJf3t1f/hz4/sUR1EA0JDMn2++ojqIBoQGuoqiGMNCA1pDeLH3T2PaDGKWy4hICEtjJSMGBJSw4hKuLhv2PE7KNSKyWLCZBbY2yTsrXYaam1UlTVwvqyRqrIGqkobKT1aQ0lhBaXFNfhqeIHPVx8B4HdvjnTdWx0NbJQkaZQQorZbyry3e9GYrSbSx8QxbHwCaZnRJA+PJijM2m3/v6HGxrEDlRQXVHJwZylFu8pps/lWdI87Hv859zw3XJm8GZjeHaFKeiWEgaFWhk9MYMS0JDImJxIc7qfaZ9dXt1C49Qx7N53kwPZSGmttPlFm//7OGMbcOUCZvFQI8aQBYRfUf2ikY3PQXQPwD9K+J9Lc0Ereh8fZsvIwJ74/r+uyswaYWbJ9EqmZMcpLvxFCrDMg7GjkZRaMnJ7ElHmDGXLjdZ16T2O1ndJDNs4etlFd1kbtOTu15xy/G6vt2Fsl7HYwmcBkEQSGmwiNNREaayY01kR4vJk+g6wkDLESGN65sd+hb35iy8of2LPhJPY2fXYio+KDePXrKUTFy/Y+NwEjrsUxtkdDmHVrP37zYgZ9B4V33ERW2TmS10TJ7mbKDtk4f7r7ImpE9jWTkO5H8kg/BuYEEBzVMZSnfqhm3eJC8j87pcsyTc2MYcn2SVgDzK7Jfweyr3arQI+EcGB2LPcuyezQ8lWfbaNoWxM/5jZx+rsWJBXGCsIEfX/hx/VjA0ifFEB4H3OHlvHdZwo4su+c7so3Z1Yyi9bcpEx+UQixuNdDGBzux/2vZTH2npR27zm+r4X89fX8+FWTKuB1BOT1vwwga1YwA7LbHxjlvl/C6sfyqa9u0VVZL1pzEzmzZNOFrcDIq9nF12MgzLglkfkrRnkMHiTZ4eCmBna/W8+5Y/qLihGbbGHUvcEMmxaE8NBaV5U2sGL+bgo/P6ObPIdE+PFG4XQi+wS6JhcBmV3d1+zzEAaEWJj7ahY335fm8fqRvGZ2vFnDuRLdh2QhNsXCzQvDSBvjOYjmF+8Us+bxfJrq9PFdMif35Zn/Gq9MflUI8USvgTDuZyE89fF4koZEuF0rL7axdWkNJwpa8DX1z/Rj8hNhxKW5T5qfPHSBl2fupPwf+gi6tWDlaCbMSXVNagNu7ErIEZ+FMH1MHL//YKxb6F3JDl+vqSNvVR1tNt8Nx222CnIeDOGmuSFuTXRNZTN/vDuXol3lmuczKMzKsv23Kfc17xVCjOzs//BJB4aJv03juc0T3QCsON7K6nsr+HJ5rU8DCNBmk/hyeS2r762g4ri8+Q2L9ue5zROZ+Ns0zfN5cTupQiMkSZrZYyGcviidectHYbbKs160rZFV/1JBaZGNnqTSIhur/qWCom2NCktpYt7yUUxflK55Hg/uKGPvxpPK5JckSbL0OAinL0pnzkuZiqEvfLmilr89eYHW5p55GkZrs8TfnrzAlytq3c6TmvNSpi5AXLe4kLZWWebSgAd7FISeALQ1SXz06Hl2/UcdvUG7/qOOjx47j61J0h2IZ47U8MU7xcrkxZIkhfQICCf+Ns0dwEaJDx6u4vCXTfQmHd7ZxAcPV2FrdAdR6z7ih0sO0lQv67/GAY/5PITpY+J4cNkIdwD/rconp1+6QycKWvjg39xBfHDZiCvFsvaqLpQ3svGNQ8rkRyVJivFZCON+FsLvPxgrG4TYmno3gG4gujTNZquJ338wlrifhWiWrw1vFFF9TtY6hVypb6hbCANCLDz18Xj5NIwEnzx9odcD6AriJ89ckA1WwqL9eerj8QSEaOMv2Vhr45PXv1cmPyRJktnnIJz7apbbSsiXK2t7XR+wM33EL1fKt3okDYlg7qtZmuVpx9qjyr5hP+B2n4Jw+MREt7Xgom2NvWYUfDWjZuU84s33pTF8YqIm+amvbvEUfu5hn4EwONyPBStHydIqjrey4dlqg7aO+mLPVrutrCxYOUrV/TOu2rLysDJprCRJ6T4B4f2vZcncsSQ7fPqHnjsR3V1qbZb49A8XZD6SUQlB3P+aNs3yyUMXPK1tP6x7CAdmx7o5pH69pq7HLcV5S6VFNr5eI++yjL0nhYHZsXqxhr+RJClc1xAqJ6TLi23krTL6gV1R3qo6yottHZarWtq3+SSVZ2RBOIOBabqFMOvWfgweLd8TsnVpjc97w6itNpvE1qXyg+EHj76OrFv7qZ+XVokv15Uok2/XJYQms2D2CxmytCN5zcZ84FXqREELR/LkHvazX8jAZBaq52XvJjfvmkmSJPnrDsJRt/en3+Bw2WBkx5s1Bk3XoB1v1sgGKf0GhzNyepLq+Th2oJKqUlmTHALcrDsIf/XQINnrg5safGJPiJ51rqSVg5vkQdGnzBusej4kCfZtPtVhk6w5hP2HRrrtD979br1BUTdIWY5DbryO/kMj9dAkT3M9uEdzCKfMk1vB4/uadbkt0yet4bFWju9r6bC81dD3eeU01MjyEQeM1AWEgaFWcu6SR3rKX99g0NONyl8vt4Y5dw0gMNSqah7abHYKtrrtmZ6iCwgzbkmURceqPtvGj18ZDgrdqR+/aqL67OXYOv5BFoZPTFA9H4Xb3CDM1gWE2VPlc1dF27QNzdETJdkd5eqqEdPUHyUX73c7sOcGzSE0W01kTJZ7efyYa1hBr1hDRblmTE50263obZUdrVH2CyMlSUrRFML0MXEyD4/6KjunvzMmp72h09+1UF91uYkJDvdTfRuAJEFJYZVHa6gZhMPGy/slR74ymmJvNslH8po6LH81dLSwUpmUpSmEaZnRstcle5oNWryoY3taOix/VSAsqNCPJRQCkofLC6HskOGu5U2VFskhTB4e7XoshCoqcbeEGZIkmTSBMCEtTHZMQ2O1vVtD9Bpy1/nTbTRWX+7vBIVZSUgLUzUPP52oo7ZK1uKFAv01gTAlQ74NtdSwgupYQ0U5K+tBlVFyidv5O4naWMJU+RN49rABoRpSlrOyHlSxyO4nzSdoAmFUgizELNVlRlOshpTlrKwHNVRV1qgTCOXnYFB7zpibUUPKclbWgzoQ6sQSRsYHKgrHsITqQNjWYT30rubYsIS92BLqpDkOUrgSNV4wIFRDrlM0nupBFQhLdWIJTRb5x+r1LLeeJrs8kqpbPaihCz+5OanEagOhYteX3TCE6kBo77ge1FBLk5vXvJ8mECotn8lkAKLKw29C8xZIEdcawKINhK12zZ/IXgmhRXRYD1rUvWYQNihOOw+MMEyhGlKevdygwanzHqyv2YTjdMbLKRbvWyXlhGVorAGhGlKWs4eJY9XHA0CbG4RqjJjOK+aKQmPNBiGqQGjusB7U6RK48dXqBqFFhb0HhiXsvZbQA182EyDzdrT6e98qVZXKn8DweMMSqiFlOSvrQQ154MtmAn5yTYmM8/56YulRebCjPoOsBiEqSFnOynpQQx74+skElMpuUmFRu6RQvtcgYYgBoRpSlrOyHlSB0J2vUhNQ5priGi/aa5awuIaGGpts6iCyr9Eke7Xy+5plUzQNNTZKi9W3hB74KnWzhFEqWEJJcsStc1W8YQ29awXT5VH8jx2oRNJgyd4DX2UeIFTHvae4QA5hyih/gxQvKnmkX4flrx6EnbCEkX3UcXQ8uFP2sQzMCUAYMzVekTA5yrej8levT9gZCFWyhEW7yqmvvjw7FBxlou8v/AxivKC+v/AjOOryE15f3eLpjBF1IOzjeWAii9nVJzlUlcy02ewUKmLWXT82wCDGC1KWa+HWM7TZtPGfi09x4+uMCTgBXNoMGhbtz3X91TmqVBlGNn2S0SR7oylOnxTQYbmrpev6hxAaJev71wInTEIIO1AoGyRkqBOn5MD2UpobLq8ahvcxc/0vDWvYrVbwlwGE97k8/dXc0MqB7dr0Bz1wVSiEsF+0O/tdr6RmqrMzv7HWRt6Hx2VpWbOCDXK6UcryzPvwOI212gQb8MDVfrgcEClfdnOGehGblOefDcj2IzbZYtDTDYpNtjAg26/D8lYVQneu8l0h3C83m1GqRWw68f15Dn0jW75m1L2GNewOKcvx0Dc/ceL789r0TYWDq3YtoRCiBLiUu6AwP+JVjFOyZeUPstfDpgURm2JYw2uygikWhk0L6rCcVR0Vp4YRFCazyued3MniE8qsYdoN6kVs2rPhJKd+qJaN6CY8EmaQdA26eWGYbKbh1A/V7NlwUrP8eODpEm+uEO5zvSNjknpH19vbJNYtlg3QGZjjT/9MY/L6atQ/04+0MfJl0HWLCzXd3+2Bp32eIPzM9Y5MlSO85392yq1vOPmJMMxWYydeV2S2CiY/EebWF8z/7JSGeTKROdkNws88QbgXKHftFw7NUTfC+7vPFMhex6VZyXkwxCCrC8p5MIS4NGuH5aq2hubEKfuD5U7e5BA6J603ut6p9qErR/adI/d9+SHNN80NISHdcPPqjBLSrdw0V/7Q5r5fwpF95zTNlweONjp5c7OEABtcX2Td2k/14NqrH8uXBc0RJrj9xQgs/kaz3JEs/oLbX4yQDUaqShtY/Vi+pvkSwv3kLiVnSgi/AOouvohODHKLsu9t1Ve3sHzebllazAAL058PN0jrQNOfDydmgHxaa8X83TJPJS2UPDxa6U1d5+TMM4RCiGZgm5ZNMsCB7Wf44p1iWVr6pEDGPGD0Dz1pzAMhpE+Su0h98U4xhZ+f0TxvHvjZ6uSsXUsI8Knri3GzU1SJyqDUmsfzOXnogixt3LxQBo0zHBxcNWh8AOPmyd2jTh66wJrH8zXPm9kiGDc7pcOmuD0INwH1rk1y9lT1rWFTXSsvz9xJTaXLQyNgxksRxvyhU/0z/ZixJAJcbERNZTMvz9xJU532B5dnT0siOlHWFNcrB78eIRRCVAPvuaZpcVo4QPk/6vjj3bkyB0xrgODuP0X1ehD7Z/px95+isAZcJrDNZuePd+dS/o86XeRxykNu3LwnhKjpjCUEeEvWHxsTR9KQCE2+SNGuclYt2itLswb2bhAvARgo7yatWrRXM7d9pZKGRHg6SfQtT/eaPA+rRRGQqwdrCLD9r8WsfbrAHcS3onpdH3HQ+ADufssdwLVPF7D9r8W6yacHXnKdXHUOQqf+5PoiZ1ay7HxitbVhWZE7iAGCO1+P7DWj5jEPhHDna5GyJvgigBuWFekmn8HhfuTMSu6Qp85CuAG4tOAYEGxhwpxUTb+cJxARMG5+KHe80nMntC3+gjteiWDc/FDZIESPAAJMmJNKQLBszvKUp1HxFSEUQrQBb7umzXh0KIGhVs1BXLlgt9tusfRJgTz4nzE9bokvId3Kg/8Z4zYP2Gazs3LBbt0BGBhqZcajQ5XJbzt56rIlBFiFywpKeGwA0xema/5Ft/+1mOembpdP3+BYWbn/3RjGLQj1ee8bs1UwbkEo978b47YSUlPZzHNTt+uqD3hR0xemEx4r66fXOTlqV1esKUmSngOevfi6qb6V+UM/4UJ5o+ZfOO5nITz18XiPI/fyYhtbl9ZwoqDF5wDsn+nH5CfC3LxhwDER/fLMnbqZhnFVRFwgK76foWyKnxdCPHetEIYAR4FL4+1tfznCnx/Zo4svHhBiYe6rWdx8X5rH60fymtnxZg3nSlp1D19sioUJj4QxMMdzXJ4v3ilmzeP5upiI9qTfvTmSSf86UGYLgFQhRN01QegEcT6w/FJ/pFVi0Q0bOHOkRjcFkHFLIvNXjPIY2k6yw8FNDex+t55zx/RXgbHJFkbdG8ywaUEeN/9XlTawfN5uDmw/o9sHKHFgGMv2T1cu8S4QQqy40ns7C6EFOARcMjd7N55k6axcXRVEcLgf97+Wxdh7Utq95/i+ZvLXN/DjV01IGp4kJUyOjelZs4IYkN1+RLLc90tY/Vi+5t4wV9IT68cy4jbZ8m4xMEQI0dotEDpBnAn8P1ljP207B3eU6a5ABmbHMuelTAaPvq7de6rPtlG0rYkfc5s4/V2LKkAKkyM40fVjA0ifJI+MoNQP3/7E2qcLNHdI7YyGTYjn2U0Tlcn/LIT4uFPl0pUPkyRpDzDi4uuK0/UsumGjLOqqnpR1az9mv5BBv8Ed+yLWV9k58lUTJXuaKTtk4/zp7jt/ObKvmYR0P5JH+DHwlwGy6FiedOqHatYtLtR0T0hXFBRmZdn+24jpK9vjvFcIMbLTD2cXIRwBfANceoR3rD3K8nnf6raQTGbByOlJTJk3mCE3Xtep9zRW2yk9ZOPsYRvVZW3UnrNTe87xu7Hajr1Vwm53nBVnsggCw02ExpoIjTUTGmsiPN5Mn0FWEoZY3U5Rak+HvvmJLSt/YM+Gkz516umClaOVixhtwI1CiL1egdAJ4lLgcde0Jb/eScHW0/qf+hgayZR5g8i5awD+Qdpvrm9uaCXvw+NsWXlYs8gI16LMyX155r/GK5OXCiGe7FI35Sog9AcKgEuz1lVlDSzK3EjdBd+YkwsMtTJ8YgIjpiWRMTlR1TXx+uoWCreeYe+mkxzYXqpZcKJrVUiEH28UTlcGvSwCMpWe090OoRPETGAPcMmc5K0/xrK5X/tcYZqtJtLHxDFsfAJpmdEkD48mKKz7lv4aamwcO1BJcUElB3eWUrSrXLMAld2pRWtuUjoptAIjhRBd3l961WtbkiS9APzBNW3Z3K/JW3/MpwtXCEhICyMlI4aE1DCiEgKJig8iMt7xOyjUisliwmQW2Nsk7K12GmptVJU1cL6skaqyBqpKGyk9WkNJYQWlxTWaRMn3pnJmJbNozU3K5BeFEIuvqsyvAUIrjlAO/3QxzdbUxjMTt3G0oAJDPVOpmTEs2T4Ja4BseunvQLYQ4qr6FqartxjCBswBmi6mWQPMPPnRWNWOoTCkrqLig3jyo7FKAJuAOVcL4DVB6ATxO+CBTmTUkI+rAwPzgJMDNIHQCeI6YKnSZD/89mij5nqQHn57tKdwv0ud9Y+mEDr1NLDZNWHMnQO44/GfG7XXA3TH4z9nzJ0DlMmbnfV+7YPB7sqoJEmhwG5c5g8lCf78yB4+X33EqEkf1S33D+R3b45UxiQqAkYJIWp1BaETxGTniDnaALHHAljpHAl321xct0bBdGZsJtB8Oc3h7HjL/QONWvV9AJuBmd0JYLdD6AQxF5hhgNgjAZzhrF90DaETxP82QOyRAP63V3jx5heSJOlXwCeAv2sf8YPnD/C3V//HqHEdjoLvfna4qgB6HcL2QATY9dFx3nroW2xNbUbtayxrgJmH3x7taRrG6wCqAmFHIB4tqOCVO3OpKmswSNBIF1e4PExEqwKgahA6QRwLfIzL9A04fBFfuTPXcHrQQKmZMe0txVU6R8G5auRD1TAFznnEjbhMaIPD+2b5/N0+7wbmS8qZlcyCFaM8rfEXAbd19zSMbiB0ghgKfABMVV7LW3+Mv/yvfT7joe2LConw41//T7anqFngWIq7u7tWQnQLoRNEE/AS8ITy2vmzjayYv9sn9qz4mjIn92X+ilFKl/yLWgo87Xq+SI+G0AXG2cBflAMWcOzi++sT+brdTupLCgqz8tulWe2F9mvC4Y61Tqv8aR66SpKkXwBrcfHQvqiK0/W89dC3fLezzCDpKjVsQjwLVo5W7gu+qL/jcEj9Tss86iJ+mnOrwB+Ap3DZPHVRezac5P1nC3UV+0bvShwYxj3PZzByuseTF1qBl3HsC9G8qdFVED/nLr61ytEzOIIwffFOMR8uOaiLsHR6VURcIHc9M4yb70tr7/yZIqf1K9BLnnUXSdK5r/kF4FFcIj1c6sDUt7LxjUNseKPIZ/fsekOBoVamL0zntoVDlPEBLz3HwOvA4q7uC+51ELrAOAJ4A5fYN66qPtfEJ69/z461R3UfscqbCg73Y8KcVGY8OlQZIdVVe4GFXQnNYUAoh3Emjukcj1Ewm+pbyVt/jC0rD7sdQ9aTlTQkwhHSZFZye5YPHOHZnu5sdCwDwo5BtAAPAotxiRjr1tnZVc6WlYfZt/kkba1SjwPPbBFkT01iyrxBng6qcVW5s0uzqjPxAQ0IuwZjCPCYs7/Y7uEllWca+HJdCXs3neTYgUqfjoAghOO41hHTkhg3O0V5VpxSdc5+32tXCtFrQHjtMMY4LeNDQL+O7q0qbWDf5lPs3XSS7/N8Iw6M2WpiaE4cI6YlkT21n8cQyAqdwnHcxyohhM95gvj0OQuSJJmB24GHgbFXur+hpoWCrWco3HaG4v0VlB3VR5wYISA+NYy0G2LImJRI5uREgsI6FSksF8d5cZ92dE6IAaF6QA4FFgC/AYI7856GmhZKCqs4WlDB0cJKSgor+emE91ux6/qHkJIRTWpGNKmZMaRkRHUWOnAc1/oesFwI8X1PqLsedw6XJEnhwDSnhZzUUd/Rk2oqmzl7rJbzZQ1UOaNsXfq7tIEL5Y3YWuy02uzYW+3Y2yRMZoHJYsJsEfj5m4mICyQqIYio+EAi44OIir/8d5/kUMKi/bv6teqAbTgORN/o6bhWA0L9AhkATHACOa2jkbUOVY7jAPRPgS/0NsFsQHh1QJqAkcAUIBu4AYjUURbPA/txBA/YAuzRwq3KgFB9MFOcMGY5f2cAoSp8dC1Q6IQuH9gvhCjprfXQqyFsx1r2BxKBhHZ+YgE/HN4+Fhzr2204PFNagRbgHFDazs8Z4ERvsXKd0f8HW3+EVHTJd8cAAAAASUVORK5CYII=";

/* ---------- scoring (ported 1:1 from profileComputation.ts) ---------- */
function scoreQ3(a) {
  switch (a) { case "always": return 2; case "sometimes": return 1; default: return 0; }
}
function scoreQ6(a) {
  switch (a) { case "strongly_agree": case "agree": return 2; case "neutral": return 1; default: return 0; }
}
function scoreQ7(a) {
  switch (a) { case "always": return 2; case "sometimes": return 1; default: return 0; }
}
function scoreIBM(a) {
  switch (a) {
    case "strongly_agree": return 2; case "agree": return 1; case "neutral": return 0;
    case "disagree": return -1; case "strongly_disagree": return -2; default: return 0;
  }
}
function computeProfile(ans) {
  const cvdc = scoreQ3(ans.q3) + scoreQ6(ans.q6) + scoreQ7(ans.q7);
  const rawIBM = scoreIBM(ans.q4) + scoreIBM(ans.q5) + scoreIBM(ans.q8);
  const ibm = Math.round((rawIBM + 6) / 2);
  const regMap = {
    body_focus: "real", think_through: "symbolic", imagine_scenarios: "imaginary",
    hold_both: "integrated", stuck_overwhelmed: "fragmented",
  };
  const register = ans.q9 ? (regMap[ans.q9] || "unknown") : "unknown";
  return { cvdc, ibm, register };
}
function synthesis(cvdc, ibm) {
  const hiC = cvdc >= 4, loC = cvdc <= 2, hiI = ibm >= 3, loI = ibm <= 2;
  if (hiC && hiI)
    return "You feel a strong pull between opposing wants, and that inner conflict shows up as inconsistency in daily life. The push-pull creates stress across several areas, which makes steady routines hard to hold.";
  if (hiC && loI)
    return "You feel pulled in opposite directions about what you want — but you can hold that complexity without falling apart. That's a strength: you can sit with tension instead of forcing a quick answer.";
  if (loC && hiI)
    return "There's a gap between your intentions and your actions. The struggle isn't conflicting desires — it's following through on what you already know you want.";
  if (loC && loI)
    return "You're clear about what you want and you generally follow through. The challenges you face may be more situational than pattern-based.";
  return "You carry some inner tension about direction, and consistency sometimes slips. Seeing the shape of that pattern is the first step to working with it.";
}
function patternName(cvdc, ibm) {
  const hiC = cvdc >= 4, loC = cvdc <= 2, hiI = ibm >= 3, loI = ibm <= 2;
  if (hiC && hiI) return "The Storm Watcher";
  if (hiC && loI) return "The Deep Current";
  if (loC && hiI) return "The Stalled Start";
  if (loC && loI) return "The Steady Course";
  return "The Crossroads";
}
const REGISTER_LINE = {
  real: "Your body usually answers first — the reaction arrives before a single thought does.",
  symbolic: "Nothing quite lands for you until it has words. The name has to come first.",
  imaginary: "You live scenarios ahead — the imagined version often arrives before the actual one.",
  integrated: "You can hold both sides of a conflict without forcing an answer. That's rarer than you think.",
  fragmented: "When both sides pull at once, everything stops. That freeze is information, not failure.",
  unknown: "",
};

/* per-pattern content for the UNLOCKED result cards */
const PATTERN_DETAIL = {
  "The Storm Watcher": {
    costs: "Decisions take twice the energy they should, because every choice is really two fights — the choice itself, and the pull underneath it. By evening the tank is empty, and the routines that would help are the first thing to go.",
    holds: "The pull holds because both wants are genuine — you can't starve one side without losing something real. It loosens when both sides get named and held at the same time, instead of taking turns winning. That's precise work, not willpower.",
  },
  "The Deep Current": {
    costs: "From the outside, you function. Inside, holding two directions at once is quiet, constant work — and because nobody sees the effort, nobody spells you. The cost isn't chaos. It's a tiredness that doesn't match your circumstances.",
    holds: "It holds because holding is what you're good at — the tension never gets loud enough to force the question. It loosens when the two wants are put in the same frame on purpose, where each can finally say what it's protecting.",
  },
  "The Stalled Start": {
    costs: "You pay in mornings. The thing you want sits there — real, and unstarted — and every day it doesn't begin costs a little more belief that it will. It reads as a discipline problem. It isn't one.",
    holds: "It holds because the block isn't where you've been looking. The wanting is settled, so pushing the wanting harder changes nothing. It loosens when the moment of starting itself gets slowed down and looked at — what actually happens in the second before the beginning doesn't happen.",
  },
  "The Steady Course": {
    costs: "Not much, day to day — which is exactly why the situational stuff, when it hits, can feel so disorienting. You're used to the machine working.",
    holds: "What you have holds because it's real. The work here isn't repair — it's range: knowing your own pattern well enough to keep it when the ground shifts.",
  },
  "The Crossroads": {
    costs: "Some days run clean, some days drag — and the inconsistency itself becomes a second problem, because you can't predict which day you're getting.",
    holds: "It holds because it's intermittent — a pattern that only shows up sometimes is the hardest kind to catch. It loosens when the showing-up gets mapped: where, when, around what.",
  },
};

/* ============================================================
   QUESTIONS — 7 total; values unchanged.
   ============================================================ */
const QUESTIONS = [
  {
    id: "q3",
    text: "Do you feel randomly pulled in two or more directions — desires, other people, vices, ADHD, whatever form it takes?",
    choices: [
      { value: "always", text: "Most days — it's the weather" },
      { value: "sometimes", text: "It comes and goes" },
      { value: "rarely", text: "Rarely — I'm usually clear" },
    ],
  },
  {
    id: "q6",
    text: "In the actual moment you reach for what you want — what happens?",
    choices: [
      { value: "strongly_agree", text: "An equal pull stops me cold" },
      { value: "agree", text: "I move, but something pulls back" },
      { value: "neutral", text: "Depends on the day" },
      { value: "strongly_disagree", text: "Nothing pulls — I reach and I go" },
    ],
  },
  {
    id: "q7",
    text: "Do you live directly in contradiction to something you genuinely believe?",
    choices: [
      { value: "always", text: "Yes — often, and I watch it happen" },
      { value: "sometimes", text: "Sometimes" },
      { value: "rarely", text: "Rarely" },
    ],
  },
  {
    id: "q4",
    text: "There's something you keep doing that you don't want to do. When do you notice?",
    choices: [
      { value: "strongly_agree", text: "After it's already happened. Again." },
      { value: "agree", text: "Before — and I do it anyway" },
      { value: "neutral", text: "It varies" },
      { value: "disagree", text: "Early enough that I can usually stop it" },
      { value: "strongly_disagree", text: "Never — there isn't a thing like that for me" },
    ],
  },
  {
    id: "q5",
    text: "There's something I genuinely want to start. The starting doesn't happen — and I can't locate why.",
    sub: "How true is this for you?",
    choices: likert(),
  },
  {
    id: "q8",
    text: "The same problem keeps finding me — different people, different places, different years. The faces change. The pattern doesn't.",
    sub: "How true is this for you?",
    choices: likert(),
  },
  {
    id: "q9",
    text: "When something happens that you don't want — what happens first?",
    choices: [
      { value: "body_focus", text: "I feel it in my body" },
      { value: "think_through", text: "I need to put it into words before it feels real" },
      { value: "imagine_scenarios", text: "I'm already scenarios ahead — how it plays out, how it looks" },
      { value: "hold_both", text: "I can hold both sides without forcing an answer" },
      { value: "stuck_overwhelmed", text: "Everything stops — I go blank or freeze" },
    ],
  },
];
function likert() {
  return [
    { value: "strongly_disagree", text: "Strongly disagree" },
    { value: "disagree", text: "Disagree" },
    { value: "neutral", text: "Neutral" },
    { value: "agree", text: "Agree" },
    { value: "strongly_agree", text: "Strongly agree" },
  ];
}

/* ---------- flow: 7 questions, no demographics ---------- */
const STEPS = [
  { type: "landing", pct: 0 },
  { type: "q", id: "q3", pct: 10 },
  { type: "q", id: "q6", pct: 18 },
  { type: "q", id: "q7", pct: 26 },
  { type: "insight", pct: 33, cta: "Keep going" },
  { type: "q", id: "q4", pct: 41 },
  { type: "q", id: "q5", pct: 48 },
  { type: "agent", pct: 54, cta: "Continue, it's got this" },
  { type: "q", id: "q8", pct: 61 },
  { type: "breath", pct: 67, cta: "Keep going" },
  { type: "q", id: "q9", pct: 74 },
  { type: "data", pct: 80, cta: "Makes sense" },
  { type: "draw", pct: 87, cta: "That's where it's headed" },
  { type: "email", pct: 93 },
  { type: "loading", pct: 97 },
  { type: "results", pct: 100 },
];
const Q_ORDER = STEPS.filter((s) => s.type === "q").map((s) => s.id);
function questionOf(id) { return QUESTIONS.find((q) => q.id === id); }

/* ============================================================ */
export default function App() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [drawn, setDrawn] = useState(false);
  const [email, setEmail] = useState("");

  const step = STEPS[idx];
  const next = () => setIdx((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setIdx((i) => Math.max(i - 1, 0));

  const pick = (qid, value) => {
    setSelected(value);
    setTimeout(() => {
      setAnswers((a) => ({ ...a, [qid]: value }));
      setSelected(null);
      next();
    }, 300);
  };
  const skipQuestion = () => { setSelected(null); next(); };
  const skipAll = () => setIdx(STEPS.length - 1);

  const showHero = step.type !== "results";
  const showProgress = step.type !== "landing" && step.type !== "results";
  const inFlow = showProgress && step.type !== "loading";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          `radial-gradient(1100px 520px at 80% -10%, ${T.glowA}, transparent 60%),` +
          `radial-gradient(900px 500px at 10% 110%, ${T.glowB}, transparent 55%),` +
          T.bg,
        color: T.ink,
        fontFamily:
          "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');
        @keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes tick { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
        @keyframes barGrow { from { width: 0 } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
        input::placeholder { color: ${T.faint}; }
      `}</style>

      <div className="mx-auto flex flex-col" style={{ maxWidth: 480, minHeight: "100vh", padding: "20px 18px 28px" }}>

        {/* header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 26 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <img src={ICON} alt="" style={{ height: 22, width: 22, display: "block" }} />
            <span style={{ fontWeight: 700, fontSize: 23, letterSpacing: "-0.02em", color: T.ink }}>
              ivasa.ai
            </span>
          </div>
          {inFlow ? (
            <button onClick={skipAll} aria-label="Skip to results"
              style={{ color: T.faint, fontSize: 22, lineHeight: 1, background: "none", border: "none", cursor: "pointer", padding: 6 }}>
              ✕
            </button>
          ) : (
            <span style={{ color: T.faint, fontSize: 20, letterSpacing: 2 }}>≡</span>
          )}
        </div>

        {/* persistent hero */}
        {showHero && (
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <h1 style={{ margin: 0 }}>
              <span style={{ display: "block", fontSize:50, lineHeight: 1.12, fontWeight: 800, letterSpacing: "-0.03em" }}>
                Real Mental Health Therapy:
              </span>
              <span style={{ display: "block", fontSize: 21, lineHeight: 1.25, fontWeight: 700, letterSpacing: "-0.01em", marginTop: 8 }}>
                <span style={{ color: T.emBright }}>See (</span>the pattern<span style={{ color: T.emBright }}>) beneath...</span>
              </span>
            </h1>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14,
              padding: "8px 16px", borderRadius: 999, fontSize: 14, color: T.ink,
              border: `1px solid ${T.line}`, background: "rgba(255,255,255,0.03)",
            }}>
              <span aria-hidden="true" style={{ color: T.emBright }}>✦</span> Free profile, no credit card
            </div>
          </div>
        )}

        {/* labeled progress */}
        {showProgress && (
          <div style={{ marginBottom: 24 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Your pattern profile</span>
              <span style={{ color: T.emBright, fontWeight: 700, fontSize: 15 }}>{step.pct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(148,163,184,0.15)" }}>
              <div style={{
                height: 8, borderRadius: 999, width: `${step.pct}%`,
                background: `linear-gradient(90deg, ${T.em}, ${T.emBright})`,
                boxShadow: `0 0 14px ${T.emLine}`,
                transition: "width .5s ease",
              }} />
            </div>
          </div>
        )}

        {/* step body */}
        <div key={idx} style={{ animation: "rise .35s ease both", flex: 1, display: "flex", flexDirection: "column" }}>
          {step.type === "landing" && <Landing onStart={next} />}
          {step.type === "q" && (
            <QuestionStep
              q={questionOf(step.id)}
              number={Q_ORDER.indexOf(step.id) + 1}
              total={Q_ORDER.length}
              selected={selected}
              onPick={pick}
              onSkip={skipQuestion}
              onBack={back}
            />
          )}
          {step.type === "insight" && <InsightCard answers={answers} onNext={next} onBack={back} cta={step.cta} />}
          {step.type === "agent" && <AgentCard onNext={next} onBack={back} cta={step.cta} />}
          {step.type === "breath" && <BreathPause onNext={next} onBack={back} cta={step.cta} />}
          {step.type === "data" && <DataCard a9={answers.q9} onNext={next} onBack={back} cta={step.cta} />}
          {step.type === "draw" && <DrawGoal drawn={drawn} setDrawn={setDrawn} onNext={next} onBack={back} cta={step.cta} />}
          {step.type === "email" && <EmailStep email={email} setEmail={setEmail} onNext={next} onBack={back} />}
          {step.type === "loading" && <LoadingStep onDone={next} />}
          {step.type === "results" && <Results answers={answers} onRestart={() => { setAnswers({}); setDrawn(false); setEmail(""); setIdx(0); }} />}
        </div>
      </div>
    </div>
  );
}

/* ---------- shared nav ---------- */
function Nav({ onBack, onNext, label, ghost }) {
  return (
    <div className="flex items-center gap-3" style={{ marginTop: 28 }}>
      {onBack && (
        <button onClick={onBack} aria-label="Back"
          style={{
            width: 56, height: 56, borderRadius: 16, flexShrink: 0, cursor: "pointer",
            background: "rgba(255,255,255,0.05)", border: `1px solid ${T.line}`,
            color: T.mute, fontSize: 20,
          }}>←</button>
      )}
      <button onClick={onNext}
        style={ghost ? {
          flex: 1, height: 56, borderRadius: 16, cursor: "pointer",
          background: "transparent", border: `1px solid ${T.line}`,
          color: T.mute, fontSize: 16, fontWeight: 600,
        } : {
          flex: 1, height: 56, borderRadius: 16, cursor: "pointer",
          background: `linear-gradient(180deg, ${T.btnBright}, ${T.btn})`,
          border: "none", color: "#ffffff", fontSize: 17, fontWeight: 800,
          boxShadow: `0 6px 24px ${T.btnLine}`,
        }}>
        {label}
      </button>
    </div>
  );
}

function Panel({ children, accent }) {
  return (
    <div style={{
      borderRadius: 20, padding: "22px 20px",
      background: T.panel,
      border: `1px solid ${accent === "violet" ? T.vioLine : accent === "emerald" ? T.emLine : T.line}`,
      backdropFilter: "blur(6px)",
    }}>
      {children}
    </div>
  );
}

/* ============================ STEPS ============================ */

function Landing({ onStart }) {
  const signals = [
    "Takes about 90 seconds",
    "Safety-First (Non-Crisis Therapy)",
    "Based on 20+ years of clinical research",
    "Completely confidential",
  ];
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: T.mute, fontSize: 16, margin: "0 0 26px" }}>
        Seven questions. One honest picture of what keeps repeating — and where a session would start.
      </p>
      <button onClick={onStart}
        style={{
          width: "100%", height: 60, borderRadius: 16, cursor: "pointer",
          background: `linear-gradient(180deg, ${T.btnBright}, ${T.btn})`,
          border: "none", color: "#ffffff", fontSize: 18, fontWeight: 800,
          boxShadow: `0 8px 28px ${T.btnLine}`,
        }}>
        Start the 7-question assessment →
      </button>
      <div style={{ marginTop: 30, textAlign: "left", display: "grid", gap: 12 }}>
        {signals.map((s) => (
          <div key={s} className="flex items-start gap-3">
            <span aria-hidden="true" style={{ color: T.emBright, fontWeight: 800 }}>✓</span>
            <span style={{ fontSize: 15, color: T.ink }}>{s}</span>
          </div>
        ))}
      </div>
      <p style={{ color: T.faint, fontSize: 12, marginTop: 26 }}>
        A reflection tool — not a diagnosis, and not emergency care.
      </p>
    </div>
  );
}

function QuestionStep({ q, number, total, selected, onPick, onSkip, onBack }) {
  return (
    <div>
      <div className="flex items-center justify-between" style={{ color: T.faint, fontSize: 13, marginBottom: 10 }}>
        <span>iVASA Assessment</span>
        <span>Question {number} of {total}</span>
      </div>
      <h2 style={{ fontSize: 23, fontWeight: 700, lineHeight: 1.35, margin: "0 0 6px", letterSpacing: "-0.01em" }}>
        {q.text}
      </h2>
      {q.sub && (
        <p style={{ color: T.mute, fontSize: 15, margin: "0 0 16px" }}>{q.sub}</p>
      )}
      <div style={{ display: "grid", gap: 10, marginTop: q.sub ? 0 : 16 }}>
        {q.choices.map((c) => {
          const active = selected === c.value;
          return (
            <button key={c.value} onClick={() => onPick(q.id, c.value)}
              style={{
                width: "100%", textAlign: "left", padding: "16px 18px", borderRadius: 14, cursor: "pointer",
                fontSize: 16, color: T.ink,
                background: active ? T.emSoft : "rgba(255,255,255,0.03)",
                border: `1px solid ${active ? T.em : T.line}`,
                boxShadow: active ? `0 0 0 3px ${T.emSoft}` : "none",
                transition: "border-color .15s ease, background .15s ease",
              }}>
              {c.text}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3" style={{ marginTop: 22 }}>
        <button onClick={onBack} aria-label="Back"
          style={{
            width: 48, height: 44, borderRadius: 12, cursor: "pointer",
            background: "rgba(255,255,255,0.05)", border: `1px solid ${T.line}`, color: T.mute,
          }}>←</button>
        <button onClick={onSkip}
          style={{ flex: 1, height: 44, borderRadius: 12, cursor: "pointer", background: "transparent", border: "none", color: T.faint, fontSize: 14 }}>
          Skip this question
        </button>
      </div>
    </div>
  );
}

/* — interstitial 1: echoes the user's own answers, then lands the line — */
function InsightCard({ answers, onNext, onBack, cta }) {
  const a3 = answers.q3, a6 = answers.q6, a7 = answers.q7;

  const echoes = [];
  if (a3 === "always") echoes.push("The pull is there most days.");
  if (a3 === "sometimes") echoes.push("The pull comes and goes.");
  if (a3 === "rarely") echoes.push("You're usually clear on what you want.");
  if (a6 === "strongly_agree") echoes.push("When you reach for it, something stops you cold.");
  if (a6 === "agree") echoes.push("When you reach for it, something pulls back.");
  if (a6 === "neutral") echoes.push("Some reaches are clean. Some aren't.");
  if (a6 === "strongly_disagree") echoes.push("When you reach, you move.");
  if (a7 === "always") echoes.push("And you're living against something you believe.");
  if (a7 === "sometimes") echoes.push("Sometimes you live against what you believe.");
  if (a7 === "rarely") echoes.push("You mostly live by what you believe.");

  const pullPresent =
    a3 === "always" || a3 === "sometimes" ||
    a6 === "strongly_agree" || a6 === "agree" ||
    a7 === "always" || a7 === "sometimes";

  const c = pullPresent
    ? {
        head: "Feels random. It isn't.",
        body: a3 === "always"
          ? "A pull this constant isn't chaos — it's a structure: real wants, real forces, none of them giving. And it runs on a schedule: specific places, specific people, specific hours. The next questions find where it lives."
          : "A pull that comes and goes isn't chaos — it shows up around specific things, at specific times. That's a pattern with a schedule. The next questions find where it lives.",
        stat: "It has a schedule,",
        statSub: "and schedules can be found.",
      }
    : {
        head: "Clarity — noted",
        body: "You're clear on the wanting, and the reaching is mostly clean. So we look where patterns actually hide for people like you: the space between wanting and doing.",
        stat: "Wanting is settled,",
        statSub: "doing is the interesting part.",
      };

  return (
    <div>
      <Panel accent="emerald">
        {echoes.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{
              color: T.faint, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", margin: "0 0 8px",
            }}>
              What you just told us
            </p>
            <div style={{ display: "grid", gap: 6 }}>
              {echoes.map((e) => (
                <div key={e} className="flex items-start gap-2">
                  <span style={{ width: 3, alignSelf: "stretch", borderRadius: 2, background: T.emLine, flexShrink: 0 }} />
                  <span style={{ color: T.ink, fontSize: 14.5, lineHeight: 1.45 }}>{e}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>{c.head}</h3>
        <p style={{ color: T.mute, fontSize: 15, lineHeight: 1.55, margin: "0 0 16px" }}>{c.body}</p>
        <div className="flex items-baseline gap-2" style={{ flexWrap: "wrap" }}>
          <span style={{ color: T.emBright, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>{c.stat}</span>
          <span style={{ color: T.mute, fontSize: 14 }}>{c.statSub}</span>
        </div>
      </Panel>
      <Nav onBack={onBack} onNext={onNext} label={`${cta} →`} />
    </div>
  );
}

/* — interstitial 2: the drafting terminal — */
function AgentCard({ onNext, onBack, cta }) {
  const lines = [
    "reading your answers so far",
    "locating the contradiction that returns",
    "measuring the wanting–doing gap",
    "drafting your pattern profile",
  ];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= lines.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 550);
    return () => clearTimeout(t);
  }, [shown, lines.length]);

  return (
    <div>
      <Panel accent="emerald">
        <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>Already drafting your profile</h3>
        <p style={{ color: T.mute, fontSize: 15, margin: "0 0 16px" }}>What it looks like:</p>
        <div style={{
          borderRadius: 14, padding: "16px 16px 14px",
          border: `1px solid ${T.vioLine}`, background: "rgba(10, 8, 22, 0.7)",
        }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
            <span aria-hidden="true" style={{ color: T.vio, fontSize: 15 }}>◉</span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Profile engine started</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: T.mute, display: "grid", gap: 9 }}>
            {lines.slice(0, shown).map((l, i) => {
              const last = i === lines.length - 1;
              return (
                <div key={l} style={{ animation: "tick .3s ease both" }}>
                  <span style={{ color: T.vio }}>$ </span>{l}{" "}
                  {last
                    ? <span style={{ color: T.vio, animation: "pulse 1.2s infinite" }}>…</span>
                    : <span style={{ color: T.vio }}>✓</span>}
                </div>
              );
            })}
          </div>
          <div style={{ borderTop: `1px solid ${T.lineSoft}`, marginTop: 14, paddingTop: 12 }}>
            <p style={{ margin: 0, fontSize: 14.5, color: T.ink, fontWeight: 600 }}>
              It keeps working while you finish the questions. Go ahead.
            </p>
          </div>
        </div>
      </Panel>
      <Nav onBack={onBack} onNext={onNext} label={`${cta} →`} />
    </div>
  );
}

/* — interstitial 3: the breath pause (unscored) — */
function BreathPause({ onNext, onBack, cta }) {
  const [chose, setChose] = useState(null);
  const options = [
    { key: "stomach", label: "My stomach moved out",
      line: "That's the settled rhythm — the one the body returns to when nothing's gripping it." },
    { key: "chest", label: "My chest lifted",
      line: "Very common. Just information, not a grade — and it changes." },
    { key: "unsure", label: "Honestly — couldn't tell",
      line: "Most people can't at first. Noticing is the skill, and you just started it." },
  ];
  const picked = options.find((o) => o.key === chose);
  return (
    <div>
      <Panel accent="violet">
        <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>Before the last stretch — a pause</h3>
        <p style={{ color: T.mute, fontSize: 15, lineHeight: 1.55, margin: "0 0 16px" }}>
          Don't answer anything yet. Take one ordinary breath, and just notice: what moved?
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          {options.map((o) => {
            const active = chose === o.key;
            return (
              <button key={o.key} onClick={() => setChose(o.key)}
                style={{
                  textAlign: "left", padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                  fontSize: 15, color: T.ink,
                  background: active ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? T.vioDeep : T.line}`,
                }}>
                {o.label}
              </button>
            );
          })}
        </div>
        {picked && (
          <p style={{ color: T.vio, fontSize: 14.5, lineHeight: 1.5, margin: "14px 0 0", animation: "rise .3s ease both" }}>
            {picked.line}
          </p>
        )}
        <p style={{ color: T.faint, fontSize: 11.5, margin: "12px 0 0" }}>
          Not scored. Just noticing.
        </p>
      </Panel>
      <Nav onBack={onBack} onNext={onNext} label={picked ? `${cta} →` : "Skip the pause →"} ghost={!picked} />
    </div>
  );
}

/* — interstitial 4: quiz results so far, you vs. everyone — */
function DataCard({ a9, onNext, onBack, cta }) {
  const rows = [
    { key: "body_focus", label: "Feel it in the body", pct: 22 },
    { key: "think_through", label: "Need words first", pct: 28 },
    { key: "imagine_scenarios", label: "Scenarios ahead", pct: 31 },
    { key: "hold_both", label: "Hold both sides", pct: 9 },
    { key: "stuck_overwhelmed", label: "Go blank / freeze", pct: 10 },
  ];
  return (
    <div>
      <Panel accent="emerald">
        <p style={{
          color: T.faint, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", margin: "0 0 8px",
        }}>
          Assessment results so far
        </p>
        <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>
          {a9 ? "Your answer, next to everyone else's" : "How everyone else answered that"}
        </h3>
        <p style={{ color: T.mute, fontSize: 15, margin: "0 0 18px" }}>
          From people who've taken this assessment — what happens first:
        </p>
        <div style={{ display: "grid", gap: 11 }}>
          {rows.map((r) => {
            const mine = a9 === r.key;
            return (
              <div key={r.key} className="flex items-center gap-3">
                <span className="flex items-center gap-2" style={{ width: 138, fontSize: 13, fontWeight: mine ? 800 : 500, color: mine ? T.ink : T.mute }}>
                  {r.label}
                  {mine && (
                    <span style={{
                      padding: "1px 7px", borderRadius: 999, fontSize: 10.5, fontWeight: 800,
                      color: "#04140d", background: T.emBright,
                    }}>
                      YOU
                    </span>
                  )}
                </span>
                <div style={{ flex: 1, height: 20, borderRadius: 8, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${r.pct}%`, borderRadius: 8,
                    background: mine ? `linear-gradient(90deg, ${T.em}, ${T.emBright})` : "rgba(16,185,129,0.25)",
                    boxShadow: mine ? `0 0 12px ${T.emLine}` : "none",
                    animation: "barGrow .7s ease both",
                  }} />
                </div>
                <span style={{ width: 40, textAlign: "right", fontSize: 13.5, fontWeight: mine ? 800 : 500, color: mine ? T.emBright : T.mute }}>
                  {r.pct}%
                </span>
              </div>
            );
          })}
        </div>
        <p style={{ marginTop: 14, marginBottom: 0, fontSize: 11.5, color: T.faint }}>
          Sample figures for this prototype — the live build pulls real distributions from assessment data.
        </p>
      </Panel>
      <Nav onBack={onBack} onNext={onNext} label={`${cta} →`} />
    </div>
  );
}

/* — the signature interaction: trajectory if you do nothing — */
function DrawGoal({ drawn, setDrawn, onNext, onBack, cta }) {
  const svgRef = useRef(null);
  const [pts, setPts] = useState([]);
  const dragging = useRef(false);
  const W = 320, H = 210, PAD = 10;

  const toPoint = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (W / rect.width);
    const cy = (e.clientY - rect.top) * (H / rect.height);
    return {
      x: Math.max(PAD, Math.min(W - PAD, cx)),
      y: Math.max(PAD, Math.min(H - PAD, cy)),
    };
  };
  const start = (e) => { dragging.current = true; setPts([toPoint(e)]); };
  const move = (e) => {
    if (!dragging.current) return;
    const p = toPoint(e);
    setPts((prev) => (prev.length && p.x <= prev[prev.length - 1].x ? prev : [...prev, p]));
  };
  const end = () => {
    if (dragging.current && pts.length > 4) setDrawn(true);
    dragging.current = false;
  };
  const clear = () => { setPts([]); setDrawn(false); };
  const path = pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
        The next 3 months — if <span style={{ color: T.emBright, fontStyle: "italic" }}>you</span> do nothing
      </h2>
      <p style={{ color: T.mute, fontSize: 15, margin: "0 0 16px" }}>
        Sketch how you think you'll be feeling.
      </p>
      <Panel>
        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>How it feels</span>
          <span style={{ color: T.faint, fontSize: 13 }}>today → 3 months</span>
        </div>
        <div style={{ position: "relative" }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            style={{ width: "100%", height: "auto", touchAction: "none", display: "block", borderRadius: 12, background: "rgba(10,8,22,0.55)", cursor: "crosshair" }}
            onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end}
          >
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1={PAD} x2={W - PAD} y1={H * f} y2={H * f} stroke={T.lineSoft} strokeWidth="1" />
            ))}
            <text x={PAD + 2} y={22} fill={T.faint} fontSize="11">Light</text>
            <text x={PAD + 2} y={H - 10} fill={T.faint} fontSize="11">Heavy</text>
            {pts.length > 1 && (
              <polyline points={path} fill="none" stroke={T.emBright} strokeWidth="3.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 6px ${T.emLine})` }} />
            )}
          </svg>
          {pts.length === 0 && (
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center",
              justifyContent: "center", pointerEvents: "none", color: T.faint, fontSize: 14,
            }}>
              draw your line ✍️
            </div>
          )}
        </div>
        <div className="flex items-center justify-between" style={{ marginTop: 8, minHeight: 20 }}>
          {drawn ? (
            <span style={{ color: T.vio, fontSize: 13, animation: "rise .3s ease both" }}>
              A trajectory, not a verdict. Patterns bend once they're seen.
            </span>
          ) : <span />}
          <button onClick={clear} style={{ background: "none", border: "none", color: T.faint, fontSize: 13, cursor: "pointer" }}>
            clear
          </button>
        </div>
      </Panel>
      <Nav onBack={onBack} onNext={onNext} label={drawn ? `${cta} →` : "Skip the sketch →"} ghost={!drawn} />
    </div>
  );
}

function EmailStep({ email, setEmail, onNext, onBack }) {
  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
        Your profile is ready
      </h2>
      <p style={{ color: T.mute, fontSize: 15, margin: "0 0 18px" }}>
        Enter your email and your full pattern profile is on the next page — plus we'll send you a copy to keep. No sequence, no spam.
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        style={{
          width: "100%", boxSizing: "border-box", height: 56, borderRadius: 14,
          padding: "0 16px", fontSize: 16, color: T.ink, outline: "none",
          background: "rgba(255,255,255,0.04)", border: `1px solid ${T.line}`,
        }}
      />
      <Nav onBack={onBack} onNext={onNext} label="Show me my profile →" />
      <button onClick={onNext}
        style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: T.faint, fontSize: 14, cursor: "pointer", padding: 8 }}>
        Continue without email
      </button>
    </div>
  );
}

function LoadingStep({ onDone }) {
  const msgs = [
    "Reading your answers…",
    "Locating the contradiction that returns…",
    "Measuring the wanting–doing gap…",
    "Naming your pattern…",
  ];
  const [m, setM] = useState(0);
  useEffect(() => {
    if (m >= msgs.length - 1) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setM((x) => x + 1), 850);
    return () => clearTimeout(t);
  }, [m, msgs.length, onDone]);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 220 }}>
      <div style={{
        width: 54, height: 54, borderRadius: "50%", marginBottom: 22,
        border: `3px solid ${T.lineSoft}`, borderTopColor: T.emBright,
        animation: "spin 1s linear infinite",
      }} />
      <p key={m} style={{ color: T.mute, fontSize: 16, animation: "rise .3s ease both" }}>{msgs[m]}</p>
    </div>
  );
}

function Results({ answers, onRestart }) {
  const skipped = !answers.q3 && !answers.q4 && !answers.q5 && !answers.q6 && !answers.q7 && !answers.q8 && !answers.q9;
  const { cvdc, ibm, register } = computeProfile(answers);
  const name = patternName(cvdc, ibm);
  const detail = PATTERN_DETAIL[name];
  const pullLabel = cvdc >= 4 ? "Strong" : cvdc >= 2 ? "Moderate" : "Low";
  const gapLabel = ibm >= 4 ? "Wide" : ibm >= 2 ? "Moderate" : "Narrow";

  const unlockedCards = [
    { title: "What this pattern costs you day to day", body: detail.costs },
    { title: "Why it holds — and what loosens it", body: detail.holds },
  ];
  const lockedCards = [
    "How a session would open, for you specifically",
    "Your first three moves",
  ];

  if (skipped) {
    return (
      <div style={{ textAlign: "center", paddingTop: 30 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 10px" }}>No answers, no problem</h2>
        <p style={{ color: T.mute, fontSize: 15, margin: "0 0 22px" }}>
          The assessment takes about 90 seconds and gives your first session a head start.
        </p>
        <button onClick={onRestart}
          style={{
            width: "100%", height: 56, borderRadius: 16, cursor: "pointer",
            background: `linear-gradient(180deg, ${T.btnBright}, ${T.btn})`,
            border: "none", color: "#ffffff", fontSize: 17, fontWeight: 800,
          }}>
          Take the assessment →
        </button>
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: T.vio, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>
        Your pattern
      </p>
      <h2 style={{
        fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 16px",
        background: `linear-gradient(90deg, ${T.emBright}, ${T.vio})`,
        WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
      }}>
        {name}
      </h2>

      <div className="flex gap-3" style={{ marginBottom: 16 }}>
        <Stat label="Inner pull" value={pullLabel} />
        <Stat label="Wanting–doing gap" value={gapLabel} />
      </div>

      <Panel accent="emerald">
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: T.ink }}>
          {synthesis(cvdc, ibm)}
          {REGISTER_LINE[register] ? " " + REGISTER_LINE[register] : ""}
        </p>
      </Panel>

      {/* unlocked cards — real, per-pattern content */}
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {unlockedCards.map((c) => (
          <div key={c.title} style={{
            borderRadius: 16, padding: "16px 18px",
            border: `1px solid ${T.emLine}`, background: T.panel,
          }}>
            <div className="flex items-center justify-between">
              <span style={{ fontWeight: 700, fontSize: 15 }}>{c.title}</span>
              <span style={{
                padding: "2px 9px", borderRadius: 999, fontSize: 10.5, fontWeight: 800,
                color: "#04140d", background: T.emBright,
              }}>
                UNLOCKED
              </span>
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 14.5, color: T.ink, lineHeight: 1.6 }}>
              {c.body}
            </p>
          </div>
        ))}

        {/* still-locked cards */}
        {lockedCards.map((t) => (
          <div key={t} style={{
            borderRadius: 16, padding: "16px 18px", position: "relative", overflow: "hidden",
            border: `1px solid ${T.line}`, background: T.panel,
          }}>
            <div className="flex items-center justify-between">
              <span style={{ fontWeight: 700, fontSize: 15 }}>{t}</span>
              <span aria-hidden="true" style={{ color: T.vio, fontSize: 14 }}>🔒</span>
            </div>
            <p aria-hidden="true" style={{
              margin: "10px 0 0", fontSize: 13.5, color: T.mute, lineHeight: 1.55,
              filter: "blur(6px)", userSelect: "none",
            }}>
              The specific opening for your pattern, the first exchange, and the three moves that follow from where you actually are.
            </p>
          </div>
        ))}
      </div>

      <p style={{ fontWeight: 700, fontSize: 15, margin: "22px 0 10px" }}>Your profile is drafted. Your guide is ready.</p>
      <div style={{ display: "grid", gap: 12 }}>
        <Guide initial="S" color={T.vioDeep} name="Sarah" title="Emotional support"
          blurb="Warm and steady — a place to say the thing out loud before anything else." />
        <Guide initial="M" color={T.em} name="Mathew" title="Deep analysis"
          blurb="Follows the pattern to its root, at the pace you set." />
      </div>

      <button style={{
        width: "100%", height: 58, borderRadius: 16, marginTop: 22, cursor: "pointer",
        background: `linear-gradient(180deg, ${T.btnBright}, ${T.btn})`,
        border: "none", color: "#ffffff", fontSize: 17, fontWeight: 800,
        boxShadow: `0 8px 28px ${T.btnLine}`,
      }}>
        Create free account — unlock the rest →
      </button>
      <p style={{ textAlign: "center", color: T.faint, fontSize: 13, margin: "8px 0 0" }}>
        Takes 30 seconds
      </p>
      <button style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: T.faint, fontSize: 14, cursor: "pointer", padding: 8 }}>
        Email me my results instead
      </button>

      <p style={{ color: T.faint, fontSize: 11.5, textAlign: "center", marginTop: 18 }}>
        A reflection tool, not a diagnosis or medical care. · Prototype: buttons here are inert — the live build wires them to signup.
      </p>
      <button onClick={onRestart} style={{ width: "100%", marginTop: 6, background: "none", border: "none", color: T.faint, fontSize: 12, cursor: "pointer", padding: 6 }}>
        ↺ restart prototype
      </button>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{
      flex: 1, borderRadius: 14, padding: "12px 14px",
      border: `1px solid ${T.line}`, background: "rgba(255,255,255,0.03)",
    }}>
      <div style={{ color: T.faint, fontSize: 12.5 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 20, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function Guide({ initial, color, name, title, blurb }) {
  return (
    <div className="flex items-start gap-3" style={{
      borderRadius: 16, padding: "14px 16px",
      border: `1px solid ${T.line}`, background: T.panel,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: color, color: "#fff", fontWeight: 800, fontSize: 18,
      }}>
        {initial}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>
          {name} <span style={{ color: T.faint, fontWeight: 500 }}>· {title}</span>
        </div>
        <p style={{ margin: "4px 0 0", color: T.mute, fontSize: 13.5, lineHeight: 1.5 }}>{blurb}</p>
      </div>
    </div>
  );
}