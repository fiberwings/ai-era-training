// A query can match words across the course name, provider and description.
// Keep IDs and tool names searchable as well, without depending on eligibility.
export function matchesCourseSearch(course,query){
 const words=String(query??'').trim().toLowerCase().split(/\s+/).filter(Boolean);
 const text=[course.title,course.provider,course.description,course.id,course.tool].filter(Boolean).join(' ').toLowerCase();
 return words.every(word=>text.includes(word));
}
