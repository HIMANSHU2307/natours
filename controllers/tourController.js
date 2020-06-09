/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const Tour = require("../models/tourModel");

const tours = [];

// 2) HANDLERS
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// tours
exports.getAllTours = async (req, res) => {
    try {
        // BUILD THE QUERY
        // 1A) FILTERING
        const queryObj = {...req.query};
        const excludeFields = ['page', 'sort', 'limit', 'fields'];// to ignore some of the fields
        excludeFields.forEach(el => delete queryObj[el]);

        // 1B) Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        // REPLACING gte with $gte
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        // console.log(JSON.parse(queryStr));
        // { difficulty: 'easy', duration: { $gte: 5 } }
        // gte, gt, lte, lt

        // console.log(queryObj);
        let query = Tour.find(JSON.parse(queryStr)) // this returns a query which is then saved in the new variable
        // 2) SORTING
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            console.log(sortBy);
            query = query.sort(sortBy);// multiple sort can be passed as (price rating)
        } else {
            query = query.sort('-createAt');
        }

        // 3) FIELD LIMITING
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v'); // - means excluding the field, __v is generated by// select: false can also be added to the schema
        }

        // 4) PAGINATION
        const page = req.query.page * 1 || 1; // * 1 convert string to number; || 1 : by default page 1
        const limit = req.query.limit * 1 || 100 // default is 100
        const skip = (page - 1) * limit;
        // page2&limit=10 
        query = query.skip(skip).limit(limit); // amount of result will pe 10 per page, skip(10) means to skip first 10 result, result 11-20 will be shown o page 2

        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) throw new Error('This page does not exist');
        }

        // EXECUTE THE QUERY
        const tours = await query;
        // Done query.sort().select().skip().limit()
        // SEND RESPONSE
        res
            .status(200)
            .json({
                status: 'success',
                result: tours.length,
                data: {
                    tours: tours
                }
            });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: 'Something went wrong'
        })
    }

}

exports.createTour = async (req, res) => {

    try {
        const newTour = await Tour.create(req.body);

        res
            .status(201)
            .json({
                status: 'success',
                data: {
                    tour: newTour
                }
            });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }

}

exports.getTour =  async (req, res) => {// ? makes a param optional

    try {
        const tour = await Tour.findById(req.params.id);
        res
            .status(200)
            .json({
                status: 'success',
                data: {
                    tour: tour
                }
            });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error
        })
    }
}

exports.updateTour = async (req, res) => {

    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }); // new: true will return a new doc on update
        res
            .status(200)
            .json({
                status: 'success',
                data: {
                    tour: tour
                }
            })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error
        })
    }

}

exports.deleteTour = async (req, res) => {

    try {
        await Tour.findByIdAndDelete(req.params.id)
        res
            .status(204) // 204 means no content
            .json({
                status: 'success',
                data: null
            })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error
        })
    }


}