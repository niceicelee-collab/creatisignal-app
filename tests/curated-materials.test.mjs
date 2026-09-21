import test from "node:test"
import assert from "node:assert/strict"
import { countries, creatorOptions, productOptions, emptyFilters, filterMaterials, materials, creators, engagement } from "../src/lib/discovery/data.ts"

test("full dictionaries and ten distinct available materials", () => {
  assert.equal(countries.length, 249)
  assert.equal(new Set(countries.map(item => item.code)).size, 249)
  assert.equal(creatorOptions.length, 30)
  assert.equal(productOptions.length, 31)
  assert.equal(filterMaterials(emptyFilters, "views").length, 10)
  assert.equal(countries.find(item => item.code === "CA").name, "加拿大")
})
test("country, creator and product filters intersect without fallback", () => {
  assert.deepEqual(filterMaterials({ ...emptyFilters, country: "加拿大" }, "views"), [])
  assert.deepEqual(filterMaterials({ ...emptyFilters, country: "英国", creator: "服装与时尚", product: "女装与内衣" }, "views").map(item => item.id), ["m2"])
})
test("view boundaries, unknown values and zero are distinct", () => {
  const cases = [0, 99999, 100000, 999999, 1000000, undefined].map((views, index) => ({ ...materials[0], id: String(index), views }))
  assert.deepEqual(filterMaterials({ ...emptyFilters, views: "low" }, "views", cases).map(item => item.views), [99999, 0])
  assert.deepEqual(filterMaterials({ ...emptyFilters, views: "medium" }, "views", cases).map(item => item.views), [999999, 100000])
  assert.deepEqual(filterMaterials({ ...emptyFilters, views: "high" }, "views", cases).map(item => item.views), [1000000])
})
test("follower threshold excludes 10,000 from the under-10k range", () => {
  const previous = creators.a1.fans
  try {
    creators.a1.fans = 10000
    assert.equal(filterMaterials({ ...emptyFilters, fans: "low" }, "views", [materials[0]]).length, 0)
    assert.equal(filterMaterials({ ...emptyFilters, fans: "medium" }, "views", [materials[0]]).length, 1)
  } finally { creators.a1.fans = previous }
})
test("duration and inclusive publication-date boundaries", () => {
  const cases = [15, 16, 30, 31].map((duration, index) => ({ ...materials[0], id: String(index), duration }))
  assert.deepEqual(filterMaterials({ ...emptyFilters, duration: "short" }, "views", cases).map(item => item.duration), [15])
  assert.deepEqual(filterMaterials({ ...emptyFilters, duration: "medium" }, "views", cases).map(item => item.duration), [16, 30])
  assert.deepEqual(filterMaterials({ ...emptyFilters, dateStart: "2026-09-17", dateEnd: "2026-09-17" }, "views").map(item => item.id), ["m2"])
})
test("sorting preserves actual zero before missing GMV; AI unknown is excluded", () => {
  const sorted = filterMaterials(emptyFilters, "gmv").map(item => item.id)
  assert.ok(sorted.indexOf("m6") < sorted.indexOf("m2"))
  assert.ok(sorted.indexOf("m6") < sorted.indexOf("m7"))
  assert.deepEqual(filterMaterials({ ...emptyFilters, ai: "yes" }, "views").map(item => item.id), ["m5"])
  assert.equal(engagement({ ...materials[0], views: 0 }), undefined)
})
