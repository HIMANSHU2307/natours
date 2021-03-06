/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable prettier/prettier */
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // 1A) FILTERING
        const queryObj = { ...this.queryString };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];// to ignore some of the fields
        excludeFields.forEach(el => delete queryObj[el]);

        // 1B) Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        // REPLACING gte with $gte
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        // console.log(JSON.parse(queryStr));
        // { difficulty: 'easy', duration: { $gte: 5 } }
        // gte, gt, lte, lt

        this.query = this.query.find(JSON.parse(queryStr));
        return this; // returning the entire object
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);// multiple sort can be passed as (price rating)
        } else {
            this.query = this.query.sort('-createAt');
        }
        return this; // returning the entire object
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v'); // - means excluding the field, __v is generated by// select: false can also be added to the schema
        }
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1; // * 1 convert string to number; || 1 : by default page 1
        const limit = this.queryString.limit * 1 || 100 // default is 100
        const skip = (page - 1) * limit;
        // page2&limit=10 
        this.query = this.query.skip(skip).limit(limit); // amount of result will pe 10 per page, skip(10) means to skip first 10 result, result 11-20 will be shown o page 2
        return this;
    }
}

module.exports = APIFeatures;