import assert from 'node:assert/strict';import fs from 'node:fs';import {test} from 'node:test';
import {BUSINESS_CATEGORY_OPTIONS} from '../lib/business-categories';import {categoryStarter,categoryExampleVideo,isStarterOffering} from '../lib/category-starter';import {parseProductMedia} from '../lib/product-media';import {normalizeProductVideoUrl} from '../lib/video/product-video';import {publicationReadiness} from '../lib/publication-readiness';

test('FE-061/BE-049: all categories have coherent admitted videos, sample media and complete private defaults',()=>{
 const refs=new Set();for(const category of BUSINESS_CATEGORY_OPTIONS){const sample=categoryStarter(category.key,'Hawassa');refs.add(sample.videoRef);assert.notEqual(sample.videoRef,'youtube:M7lc1UVf-VE');assert.equal(normalizeProductVideoUrl(sample.page.videoUrl).managedRef,sample.videoRef);assert.ok(sample.page.about.includes('Hawassa'));assert.ok(fs.existsSync('public'+sample.page.heroImage));assert.equal(sample.offerings.length,3);
 for(const offering of sample.offerings){assert.ok(isStarterOffering(offering.name,offering.description));assert.equal(parseProductMedia([{kind:'image',ref:offering.image},{kind:'image',ref:offering.galleryImage},{kind:'video',ref:sample.videoRef}]).length,3);assert.ok(fs.existsSync('public'+offering.image));assert.ok(fs.existsSync('public'+offering.galleryImage));}
 assert.equal(publicationReadiness(sample.page,sample.offerings.map(p=>({name:p.name,description:p.description,is_published:1})),true).find(c=>c.key==='offerings')?.ready,false);
 }
 assert.equal(refs.size,BUSINESS_CATEGORY_OPTIONS.length);assert.equal(categoryExampleVideo('invalid'),categoryStarter('other-manufacturing').videoRef);assert.equal(isStarterOffering('Real item','Real description'),false);
});
