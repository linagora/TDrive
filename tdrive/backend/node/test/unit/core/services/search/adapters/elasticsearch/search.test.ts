import "reflect-metadata";
import {describe, it} from "@jest/globals";
import {buildSearchQuery} from "../../../../../../../src/core/platform/services/search/adapters/elasticsearch/search";
import {DriveFile} from "../../../../../../../src/services/documents/entities/drive-file";
import {FindFilter, FindOptions} from "../../../../../../../src/core/platform/services/search/api";
import {
    comparisonType
} from "../../../../../../../src/core/platform/services/database/services/orm/repository/repository";

describe("ES Query Builder", () => {

    describe("The intervals section of the search query", () => {

        it("'lte' section become a proper 'range' array in ES query", async () => {
            //given::
            const filters: FindFilter = {};
            const options: FindOptions = {
                $lte: [["last_modified", 10] as comparisonType]
            };

            //when
            let esReq = buildSearchQuery(DriveFile, filters, options);

            //then
            const expected: any = {
                bool: {
                    boost: 1,
                    must: [
                        {
                            range: {
                                last_modified: {
                                    lte: 10
                                }
                            }
                        }
                    ]
                }
            }
            const query = esReq.esParams.body["query"];
            expect(query).not.toBeNull();
            expect(query).toEqual(expected);
        });

        it("'lte' section shouldn't exist if some params are missing", async () => {
            //given::
            const filters: FindFilter = {};
            const options: FindOptions = {
                $lte: []
            };

            //when
            let esReq = buildSearchQuery(DriveFile, filters, options);

            //then
            const expected: any = {
                bool: {
                    boost: 1
                }
            }
            const query = esReq.esParams.body["query"];
            expect(query).not.toBeNull();
            expect(query).toEqual(expected);
        });

        it("'gte' section become a proper 'range' array in ES query", async () => {
            //given::
            const filters: FindFilter = {};
            const options: FindOptions = {
                $gte: [["last_modified", 10] as comparisonType]
            };

            //when
            let esReq = buildSearchQuery(DriveFile, filters, options);

            //then
            const expected: any = {
                bool: {
                    boost: 1,
                    must: [
                        {
                            range: {
                                last_modified: {
                                    gte: 10
                                }
                            }
                        }
                    ]
                }
            }
            const query = esReq.esParams.body["query"];
            expect(query).not.toBeNull();
            expect(query).toEqual(expected);
        });

        it("'gt' section become a proper 'range' array in ES query", async () => {
            //given::
            const filters: FindFilter = {};
            const options: FindOptions = {
                $gt: [["last_modified", 10] as comparisonType]
            };

            //when
            let esReq = buildSearchQuery(DriveFile, filters, options);

            //then
            const expected: any = {
                bool: {
                    boost: 1,
                    must: [
                        {
                            range: {
                                last_modified: {
                                    gt: 10
                                }
                            }
                        }
                    ]
                }
            }
            const query = esReq.esParams.body["query"];
            expect(query).not.toBeNull();
            expect(query).toEqual(expected);
        });

        it("'lt' section become a proper 'range' array in ES query", async () => {
            //given::
            const filters: FindFilter = {};
            const options: FindOptions = {
                $lt: [["last_modified", 10] as comparisonType]
            };

            //when
            let esReq = buildSearchQuery(DriveFile, filters, options);

            //then
            const expected: any = {
                bool: {
                    boost: 1,
                    must: [
                        {
                            range: {
                                last_modified: {
                                    lt: 10
                                }
                            }
                        }
                    ]
                }
            }
            const query = esReq.esParams.body["query"];
            expect(query).not.toBeNull();
            expect(query).toEqual(expected);
        });

    });


});